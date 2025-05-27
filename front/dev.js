
// Development entry point
import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);

console.log('Running in development mode from dev.js');

// Add dev script
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode is active');
}
