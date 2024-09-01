import { BehaviorSubject, Subject } from "rxjs";
import { Train } from "./Train";

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export interface ISpeechCommands {
    recognizedBeep$: Subject<string>
    recognizedLightOn$: Subject<string>
    recognizedLightOff$: Subject<string>
    recognizedSpeed$: Subject<{ trainName: string, speed: number }>
}

export class SpeechCommands implements ISpeechCommands {

    constructor(
        private trains: Train[],
        private cultureCode: string
    ) {
    }

    recognizedBeep$ = new Subject<string>()
    recognizedLightOn$ = new Subject<string>()
    recognizedLightOff$ = new Subject<string>()
    recognizedSpeed$ = new Subject<{ trainName: string, speed: number }>()
    recognizedCommand$ = new BehaviorSubject<string>("---")

    private recognition: any | null = null
    recognitionStarted$ = new BehaviorSubject<boolean>(false)

    init = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log("Web Speech API is not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = this.cultureCode;

        this.recognition.onstart = () => {
        };

        this.recognition.onend = () => {
        };

        this.recognition.onresult = (event: any) => {
            const lastResultIndex = event.results.length - 1;
            const command = event.results[lastResultIndex][0].transcript.trim();
            console.log("Speech recognition result:", command);
            this.recognizedCommand$.next(this.handleCommand(command)
                ? command
                : "---")
        };

        this.recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
        };
    }

    handleCommand = (command: string): boolean => {
        const isRecognized = this.trains.map(train => {

            const trainName = train.voiceCommands[this.cultureCode]
            command = command.toLocaleLowerCase()
            switch (command) {
                case `${trainName} гудок`:
                case `${trainName} гуди`:
                case `${trainName} сигнал`:
                case `${trainName} бикай`:
                case `${trainName} бип`:
                case `${trainName} биби`:
                    console.log("BEEP");
                    this.recognizedBeep$.next(train.name);
                    break;
                case `${trainName} свет`:
                case `${trainName} огни`:
                case `${trainName} фары`:
                    console.log("LIGHT_ON");
                    this.recognizedLightOn$.next(train.name);
                    break;
                case `${trainName} туши`:
                case `${trainName} потухни`:
                case `${trainName} гаси`:
                    console.log("LIGHT_OFF");
                    this.recognizedLightOff$.next(train.name);
                    break;
                case `${trainName} вперёд`:
                    console.log("SPEED_50");
                    this.recognizedSpeed$.next({
                        trainName: train.name,
                        speed: 50,
                    });
                    break;
                case `${trainName} полный вперед`:
                    console.log("SPEED_100");
                    this.recognizedSpeed$.next({
                        trainName: train.name,
                        speed: 100,
                    });
                    break;
                case `${trainName} назад`:
                    console.log("SPEED_-50");
                    this.recognizedSpeed$.next({
                        trainName: train.name,
                        speed: -50,
                    });
                    break;
                case `${trainName} полный назад`:
                    console.log("SPEED_-100");
                    this.recognizedSpeed$.next({
                        trainName: train.name,
                        speed: -100,
                    });
                    break;
                case `${trainName} стоп`:
                case `${trainName} стой`:
                case `${trainName} тормози`:
                case `${trainName} остановка`:
                case `${trainName} остановись`:
                    console.log("SPEED_0");
                    this.recognizedSpeed$.next({
                        trainName: train.name,
                        speed: 0,
                    });
                    break;
                default:
                    if (command.startsWith(`${trainName} скорость`)) {
                        const parts = command.split(" ")
                        const speedStr = parts[parts.length - 1]
                        const speed = Number(speedStr) * 10
                        console.log("SPEED_" + speed);
                        this.recognizedSpeed$.next({
                            trainName: train.name,
                            speed: speed,
                        });
                    }
                    else {
                        return false
                    }
            }

            return true
        }).some(x => x)

        if (!isRecognized) {
            console.log("Unknown command:", command);
        }

        return isRecognized
    }

    start = () => {
        this.recognition?.start();
        this.recognitionStarted$.next(true)
    };

    stop = () => {
        this.recognition?.stop();
        this.recognitionStarted$.next(false)
    };
}