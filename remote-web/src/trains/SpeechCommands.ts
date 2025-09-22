import { BehaviorSubject, Subject } from "rxjs";
import { Train } from "./Train";

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export interface ISpeechCommands {
    recognizedBeep$: Subject<number>
    recognizedStop$: Subject<number>
    recognizedSpeedUp$: Subject<number>
    recognizedSpeedDown$: Subject<number>
    recognizedLightToggle$: Subject<number>
}

export class SpeechCommands implements ISpeechCommands {

    constructor(
        private trains: Train[],
        private cultureCode: string
    ) {
    }

    recognizedBeep$ = new Subject<number>()
    recognizedStop$ = new Subject<number>()
    recognizedSpeedUp$ = new Subject<number>()
    recognizedSpeedDown$ = new Subject<number>()
    recognizedLightToggle$ = new Subject<number>()
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
                    this.recognizedBeep$.next(train.id);
                    break;
                case `${trainName} стоп`:
                case `${trainName} стой`:
                case `${trainName} тормози`:
                case `${trainName} остановка`:
                case `${trainName} остановись`:
                    console.log("STOP");
                    this.recognizedStop$.next(train.id);
                    break;
                case `${trainName} вперёд`:
                case `${trainName} быстрее`:
                case `${trainName} быстрей`:
                    console.log("SPEED_UP");
                    this.recognizedSpeedUp$.next(train.id);
                    break;
                case `${trainName} назад`:
                case `${trainName} медленнее`:
                case `${trainName} медленней`:
                    console.log("SPEED_DOWN");
                    this.recognizedSpeedDown$.next(train.id);
                    break;
                case `${trainName} свет`:
                case `${trainName} огни`:
                case `${trainName} фары`:
                case `${trainName} туши`:
                case `${trainName} потухни`:
                case `${trainName} гаси`:
                    console.log("LIGHT_TOGGLE");
                    this.recognizedLightToggle$.next(train.id);
                    break;
                default:
                    return false
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