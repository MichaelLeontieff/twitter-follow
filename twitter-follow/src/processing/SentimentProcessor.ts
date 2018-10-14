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
        let stemmer = natural.PorterStemmer;
        let Classifier = natural.BayesClassifier;

        SentimentProcessor.analyser = new Analyzer("English", stemmer, "afinn");
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
            SentimentProcessor.convertCSVToTrainingModel().then(trainingModel => {
                SentimentProcessor.loadTrainingModel();
                let classification = SentimentProcessor.classifier.classify(value);
                console.log(`Classified input: ${value} with guess ${classification}`);
                resolve(classification); 
            })
        });
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