package app.scriptureforge.ai;

import android.app.Activity;
import android.content.Intent;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "SFGoogleAuth")
public class SFGoogleAuthPlugin extends Plugin {
  private static final int RC_SIGN_IN = 9001;

  private PluginCall pendingCall;
  private GoogleSignInClient googleSignInClient;

  @Override
  public void load() {
    Activity activity = getActivity();
    if (activity == null) return;

    // IMPORTANT: This must be your OAuth Web client id (not Android client id).
    // Set it in android/app/src/main/res/values/strings.xml as google_web_client_id.
    String webClientId = getContext().getString(R.string.google_web_client_id);

    GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
      .requestEmail()
      .requestIdToken(webClientId)
      .build();

    googleSignInClient = GoogleSignIn.getClient(activity, gso);
  }

  @PluginMethod
  public void signIn(PluginCall call) {
    if (googleSignInClient == null) {
      call.reject("GoogleSignInClient not initialized. Ensure google_web_client_id is set.");
      return;
    }

    if (pendingCall != null) {
      call.reject("A sign-in request is already in progress");
      return;
    }

    pendingCall = call;
    Intent signInIntent = googleSignInClient.getSignInIntent();

    // Use Capacitor's ActivityCallback mechanism (more reliable than overriding handleOnActivityResult)
    startActivityForResult(call, signInIntent, "onSignInResult");
  }

  @PluginMethod
  public void signOut(PluginCall call) {
    if (googleSignInClient == null) {
      call.resolve();
      return;
    }

    googleSignInClient.signOut().addOnCompleteListener(task -> call.resolve());
  }

  @ActivityCallback
  private void onSignInResult(PluginCall call, ActivityResult result) {
    if (pendingCall == null) {
      // No call in progress
      return;
    }

    Intent data = result.getData();
    if (data == null) {
      pendingCall.reject("Google sign-in cancelled");
      pendingCall = null;
      return;
    }
    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);

    try {
      GoogleSignInAccount account = task.getResult(ApiException.class);
      String idToken = account != null ? account.getIdToken() : null;

      if (idToken == null || idToken.isEmpty()) {
        pendingCall.reject("No idToken returned. Ensure you used the correct Web client ID and enabled Google Sign-In.");
        return;
      }

      JSObject ret = new JSObject();
      ret.put("idToken", idToken);
      ret.put("email", account.getEmail());
      ret.put("displayName", account.getDisplayName());
      ret.put("photoUrl", account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : null);

      pendingCall.resolve(ret);
    } catch (ApiException e) {
      pendingCall.reject("Google sign-in failed", String.valueOf(e.getStatusCode()), e);
    } finally {
      pendingCall = null;
    }
  }
}
