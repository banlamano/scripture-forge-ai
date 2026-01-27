package app.scriptureforge.ai;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Register custom plugin for native Google Sign-In
    registerPlugin(SFGoogleAuthPlugin.class);
  }
}
