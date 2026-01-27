# Builds a DEBUG APK for the Capacitor Android wrapper.
# Output: android\app\build\outputs\apk\debug\app-debug.apk
#
# Usage (PowerShell as Administrator recommended):
#   .\build-debug-apk.ps1
#
# Notes:
# - Installs Temurin JDK 21 via winget if needed.
# - Installs Android SDK Command Line Tools + required packages into C:\Android\Sdk if needed.

$ErrorActionPreference = "Stop"

# ---------- Settings ----------
$SdkRoot = "C:\Android\Sdk"
$ToolsZipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$TempDir = "$env:TEMP\tmp_rovodev_android_setup"

$MobileDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AndroidDir = Join-Path $MobileDir "android"

function Ensure-Dir([string]$p) {
  if (!(Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

function Add-ToPath([string]$p) {
  if ($env:Path -notlike "*$p*") { $env:Path = "$p;$env:Path" }
}

function Try-Resolve-JavaHome([int]$RequiredMajor) {
  $bases = @(
    "C:\\Program Files\\Eclipse Adoptium",
    "C:\\Program Files\\Adoptium",
    "C:\\Program Files\\Java"
  )

  foreach ($base in $bases) {
    if (Test-Path $base) {
      $jdk = Get-ChildItem $base -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match ("jdk-" + $RequiredMajor) } |
        Sort-Object Name -Descending |
        Select-Object -First 1
      if ($jdk) { return $jdk.FullName }
    }
  }

  return $null
}

function Test-JavaExe([string]$JavaExe) {
  try {
    $out = & $JavaExe -version 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0 -and $out) { return $true }
  } catch {}
  return $false
}

function Ensure-Java {
  $RequiredMajor = 21

  # Prefer setting JAVA_HOME to a JDK 21 install explicitly (more reliable than PATH on Windows).
  $resolvedHome = Try-Resolve-JavaHome -RequiredMajor $RequiredMajor
  if ($resolvedHome) {
    $env:JAVA_HOME = $resolvedHome
    Add-ToPath (Join-Path $env:JAVA_HOME "bin")
  }

  $javaExe = "java"
  if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    $javaExe = (Join-Path $env:JAVA_HOME "bin\java.exe")
  }

  if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    $javaExe = (Join-Path $env:JAVA_HOME "bin\java.exe")
    Write-Host "==> Using JAVA_HOME: $env:JAVA_HOME"
    # `java -version` writes to stderr; PowerShell can treat that as an error.
    # Use cmd.exe to avoid NativeCommandError.
    cmd /c "\"$javaExe\" -version >NUL 2>&1"
    return
  }

  Write-Host "==> Java $RequiredMajor not configured. Installing Temurin JDK $RequiredMajor via winget..."
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw "winget is not available. Install Java $RequiredMajor manually, then rerun."
  }

  & winget install --id EclipseAdoptium.Temurin.21.JDK -e --accept-source-agreements --accept-package-agreements

  # Re-resolve after install
  $resolvedHome = Try-Resolve-JavaHome -RequiredMajor $RequiredMajor
  if ($resolvedHome) {
    $env:JAVA_HOME = $resolvedHome
    Add-ToPath (Join-Path $env:JAVA_HOME "bin")
    $javaExe = (Join-Path $env:JAVA_HOME "bin\java.exe")
  }

  if (-not $env:JAVA_HOME -or !(Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    throw "Java $RequiredMajor installation finished but JAVA_HOME could not be resolved. Please set JAVA_HOME to your JDK $RequiredMajor folder (e.g. C:\Program Files\Eclipse Adoptium\jdk-21... ) and rerun."
  }

  $javaExe = (Join-Path $env:JAVA_HOME "bin\java.exe")
  Write-Host "==> Java configured: $javaExe"
  cmd /c "\"$javaExe\" -version"
}

function Ensure-AndroidSdk {
  Ensure-Dir $SdkRoot

  $sdkmanager = Get-Command sdkmanager -ErrorAction SilentlyContinue
  if (-not $sdkmanager) {
    Write-Host "==> Android sdkmanager not found. Installing Android command line tools..."

    Ensure-Dir $TempDir
    $zipPath = Join-Path $TempDir "cmdline-tools.zip"
    Invoke-WebRequest -Uri $ToolsZipUrl -OutFile $zipPath

    $cmdlineToolsBase = Join-Path $SdkRoot "cmdline-tools"
    $latestDir = Join-Path $cmdlineToolsBase "latest"

    Ensure-Dir $cmdlineToolsBase
    if (Test-Path $latestDir) { Remove-Item -Recurse -Force $latestDir }

    Expand-Archive -Path $zipPath -DestinationPath $TempDir -Force

    Ensure-Dir $latestDir
    Move-Item -Force (Join-Path $TempDir "cmdline-tools\*") $latestDir
  }

  # Configure env vars for this session
  $env:ANDROID_SDK_ROOT = $SdkRoot
  Add-ToPath (Join-Path $env:ANDROID_SDK_ROOT "platform-tools")
  Add-ToPath (Join-Path $env:ANDROID_SDK_ROOT "cmdline-tools\latest\bin")

  $sdkmanager = Get-Command sdkmanager -ErrorAction SilentlyContinue
  if (-not $sdkmanager) {
    throw "sdkmanager still not available. Check $SdkRoot\cmdline-tools\latest\bin exists."
  }

  Write-Host "==> Installing Android SDK packages..."
  & sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

  Write-Host "==> Accepting Android SDK licenses..."
  "y`n" * 200 | & sdkmanager --licenses | Out-Host
}

function Build-Apk {
  if (!(Test-Path $AndroidDir)) {
    throw "Android project not found at: $AndroidDir"
  }

  Write-Host "==> Installing npm dependencies..."
  Push-Location $MobileDir
  & npm.cmd install
  & npm.cmd run cap:sync
  Pop-Location

  Write-Host "==> Building debug APK..."
  Push-Location $AndroidDir
  # Force Gradle to use the configured JDK (avoids picking up an older Java from PATH)
  & .\gradlew.bat ("-Dorg.gradle.java.home=" + $env:JAVA_HOME) assembleDebug
  Pop-Location

  $apk = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
  if (!(Test-Path $apk)) {
    throw "Build completed but APK not found at expected path: $apk"
  }

  Write-Host ""
  Write-Host "SUCCESS: Debug APK created at:"
  Write-Host $apk
  Write-Host ""
  Write-Host "Copy this file to your phone (Drive/USB) and install it (enable 'Install unknown apps' if prompted)."
}

Write-Host "==> Starting debug APK build for ScriptureForge AI"
Ensure-Java
Ensure-AndroidSdk
Build-Apk
