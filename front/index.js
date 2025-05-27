
import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);

// For web support
if (module.hot) {
  module.hot.accept();
}
