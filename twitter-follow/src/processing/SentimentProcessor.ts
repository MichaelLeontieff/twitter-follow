import * as natural from 'natural';
import path = require('path');
import csvtojson = require("csvtojson");

export const GOP_DEBATE = "/../datasource/trainingdata/Sentiment.csv";
export const AIRLINE = "/../datasource/trainingdata/Tweets.csv";

export class SentimentProcessor {
    private static instance: SentimentProcessor;
    private static analyser;
    private static tokeniser;
    private static classifier;
    private static trainingModel;

    private static hasLoadedTrainingModel;

    constructor() {
        let Analyzer = natural.SentimentAnalyzer;
        let Tokeniser = natural.OrthographyTokenizer;
        let Stemmer = natural.PorterStemmer;
        let Classifier = natural.BayesClassifier;

        SentimentProcessor.analyser = new Analyzer("English", Stemmer, "afinn");
        SentimentProcessor.tokeniser = new Tokeniser({language: "en"});
        SentimentProcessor.classifier = new Classifier();
    }

    public static getInstance() {
        if(!SentimentProcessor.instance) {
            SentimentProcessor.instance = new SentimentProcessor();
        }
        return SentimentProcessor.instance;
    }

    public getSentiment(value: string) {
        return SentimentProcessor.analyser.getSentiment(
            SentimentProcessor.getTokens(value)
        );
    }

    public static getTokens(value: string): string[] {
       return SentimentProcessor.tokeniser.tokenize(value);
    }

    public getClassification(value: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // SentimentProcessor.convertCSVToTrainingModel().then(trainingModel => {
            //     SentimentProcessor.loadTrainingModel();

            //     SentimentProcessor.classifier.save(__dirname + '/classifier.json', (err, classifier) => {
            //         // the classifier is saved to the classifier.json file!
            //     });

            //     let classification = SentimentProcessor.classifier.classify(value);
            //     console.log(`Classified input: ${value} with guess ${classification}`);
            //     resolve(classification); 
            // })

            SentimentProcessor.loadPreProcessedTrainingModel().then(preTrainedModel => {
                let classification = SentimentProcessor.classifier.classify(value);
                // TODO: compare with sentiment analysis value
                console.log(`Classified input: ${value} with guess ${classification}`);
                resolve(classification); 
            });
        });
    }

    public getClassifications(values: string[]): Promise<string>[] {
        return values.map(value => this.getClassification(value));
    }

    public static convertCSVToTrainingModel(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (SentimentProcessor.trainingModel) {
                resolve(SentimentProcessor.trainingModel);
            } else {
                let trainingPath = path.normalize(__dirname + AIRLINE);
                csvtojson()
                    .fromFile(trainingPath)
                    .then((jsonObj)=>{
                        SentimentProcessor.trainingModel = SentimentProcessor.formatParsedTrainingData(jsonObj);
                        resolve(SentimentProcessor.trainingModel);
                    });
            }
        });
    }

    public static loadPreProcessedTrainingModel() {
        return new Promise((resolve, reject) => {
            if (SentimentProcessor.trainingModel) {
                resolve(SentimentProcessor.trainingModel);
            } else {
                natural.BayesClassifier.load(__dirname + '/classifier.json', null, (err, storedClassifier) => {
                    SentimentProcessor.classifier = storedClassifier.classifier;
                    //SentimentProcessor.trainingModel.train();

                    console.info('Loaded pre-trained model');
                    resolve(SentimentProcessor.classifier);
                });
            }
        });
    }

    private static loadTrainingModel() {
        if (SentimentProcessor.hasLoadedTrainingModel) return SentimentProcessor.classifier;

        SentimentProcessor.trainingModel.forEach(element => {
            SentimentProcessor.classifier.addDocument(element.text, element.label);
        });

        SentimentProcessor.classifier.train();
        console.log("CALLED TRAINING ON MODEL");
        SentimentProcessor.hasLoadedTrainingModel = true;

        return SentimentProcessor.classifier;
    }

    private static formatParsedTrainingData(trainingData: any[]) {
        return trainingData.map((tweetData) => {
            return {
                text: tweetData.text,
                label: tweetData.airline_sentiment
            }
        })
    }
}

export enum Classifications {
    POSITIVE = "positive",
    NEGATIVE = "negative",
    NEUTRAL = "neutral"
}