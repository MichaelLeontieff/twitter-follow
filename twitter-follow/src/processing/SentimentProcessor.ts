import * as natural from 'natural';
import path = require('path');
import csvtojson = require("csvtojson");
import { ClassifiedTweet } from '../interfaces/ClassifiedTweet';
import { Classifications } from '../enums/Classifications';

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

    public getClassification(value: string): Promise<ClassifiedTweet> {
        return new Promise((resolve, reject) => {
            SentimentProcessor.loadPreProcessedTrainingModel().then(preTrainedModel => {
                let classification = SentimentProcessor.classifier.classify(value);
                let sentiment = this.getSentiment(value);
                let deviation = SentimentProcessor.logClassificationDeviation(classification, sentiment);
                console.log(`Classified input: ${value} with guess ${deviation.classification}`);
                resolve({tweet: value, classification: deviation.classification}); 
            });
        });
    }

    public getClassifications(values: string[]): Promise<ClassifiedTweet>[] {
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
                natural.BayesClassifier.load(__dirname + '/../datasource/trainingdata/classifier.json', null, (err, storedClassifier) => {
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

    private static logClassificationDeviation(classification: string, sentiment: number) {
        classification = SentimentProcessor.mapSentimentToClassification(sentiment);
        if (classification !== SentimentProcessor.mapSentimentToClassification(sentiment)) {
            console.log(`Classification ${classification} deviates from sentiment ${sentiment}`);
        }
        return {classification};
    }

    private static mapSentimentToClassification(sentiment: number) {
        if (sentiment === 0) return Classifications.NEUTRAL;
        if (sentiment > 0) return Classifications.POSITIVE;
        if (sentiment < 0) return Classifications.NEGATIVE;
    }
}
