import 'dotenv/config';
import { Log } from './logging_middleware/index';

async function runTest() {
    console.log("Attempting to send log to evaluation server...");
    
    await Log("backend", "info", "middleware", "Logging middleware initialized successfully.");
    
    console.log("Check the console above. If there are no errors, it was successful!");
}

runTest();