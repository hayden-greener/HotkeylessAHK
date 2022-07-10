import * as express from "express";
import { RequestHandler, Response } from "express";

export class HotkeylessAHKServer {

    // Setup server
    private app = express();
    private router = express.Router();

    private pendingResult: Response = null;
    private list = "";

    /**
     * Handles the subscriber aka. redirecting ahk script
     */
    private subscriberFunction: RequestHandler = (req, res) => {
        this.pendingResult = res;
        console.log("Received subscriber.");
    };

    /**
     * Handles the sender aka the caller e.g. a stream deck
     */
    private sendFunction: RequestHandler = (req, res) => {
        if (this.pendingResult !== null) {
            const command = req.params.command;
            this.pendingResult.send(command);
            this.pendingResult = null;
            res.send("success");
            console.log(`Send command: ${command}`);
        } else {
            console.error("No subscribing process registered. Please call '/subscribe' first!");
            res.send("failure");
        }
    };

    private setListFunction: RequestHandler = (req, res) => {
        const list = req.params.list as String;

        // This is required due to the last comma added in the ahk code
        this.list = list.substring(0, list.length - 1);
        res.send("success");
    };

    private getListFunction: RequestHandler = (req, res) => {
        res.send(this.list);
    }


    /**
     * Stops the node process
     */
    private killFunction: RequestHandler = (req, res) => {
    console.log("Shutting down server...");
    process.exit(0);
};

constructor(private serverPort: number) {
}

setup() {
    console.log("Starting server...");

    this.router.get("/subscribe", this.subscriberFunction);
    this.router.get("/send/:command", this.sendFunction);

    this.router.get("/kill", this.killFunction);

    this.router.get("/setList/:list", this.setListFunction)
    this.router.get("/list", this.getListFunction)

    // Start server
    this.app.use('/', this.router);
    this.app.listen(this.serverPort);
    console.log(`Server running on port ${this.serverPort}.`);
    console.log("Please use the '/subscribe' endpoint first!");
}
}
