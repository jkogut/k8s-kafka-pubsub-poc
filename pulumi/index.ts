import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// need to initialize pulumi config for secret prod/cons images
let config = new pulumi.Config();

// Deploy the latest version of the incubator/zookeeper chart.
const zookeeper = new k8s.helm.v2.Chart("zookeeper", {
    repo: "incubator",
    version: "1.2.0",
    chart: "zookeeper",
    values: {
        persistence: { size : "1Gi" }
    }
});

// Deploy the latest version of the incubator/kafka chart.
const kafka = new k8s.helm.v2.Chart("kafka", {
    repo: "incubator",
    version: "0.13.11",
    chart: "kafka",
    values: {
        topics: [{
            name: "test-topic",
            partitions: 8,
            replicationFactor: 3,
            defaultConfig: "segment.bytes,segment.ms",
            config: "cleanup.policy=compact,delete.retention.ms=604800000" //<-- ADDED for purpose to have a faulty kafka topic !!! 
            // [2019-03-11 16:28:29,253] ERROR Error when sending message to topic test-topic with key: null, value: 28 bytes with error: 
            // (org.apache.kafka.clients.producer.internals.ErrorLoggingCallback) org.apache.kafka.common.errors.CorruptRecordException: 
            // This message has failed its CRC checksum, exceeds the valid size, or is otherwise corrupt.
        },
        {   
            name: "test-topic2",
            partitions: 8,
            replicationFactor: 3
        },   
        {   // topic for pub-sub app written in golang   
            name: "golang-topic",
            partitions: 8,
            replicationFactor: 3
        }   

    ],  // zookeeper config for kafka brokers
        zookeeper: { 
            enabled: false,
            url: "zookeeper"
        }
    }
});

// Kafka producer
let prodImage = config.require("prodImage")

const prodName = "go-kafka-producer";
const prodLabels = { app: prodName };
const goKafkaProducer = new k8s.apps.v1beta1.Deployment(prodName, {
    spec: {
        selector: { matchLabels: prodLabels },
        replicas: 1,
        template: {
            metadata: { labels: prodLabels },
            spec: { containers: [
                        { 
                            name: prodName, 
                            image: prodImage,
                            resources: { requests: { cpu: "50m", memory: "100Mi" } }
                        }]
                    }
        }
    }
});

// Kafka consumer
let consImage = config.require("consImage");

const consName = "go-kafka-consumer";
const consLabels = { prod: consName };
const goKafkaConsumer = new k8s.apps.v1beta1.Deployment(consName, {
    spec: {
        selector: { matchLabels: consLabels },
        replicas: 1,
        template: {
            metadata: { labels: consLabels },
            spec: { containers: [
                        { 
                            name: consName, 
                            image: consImage,
                            resources: { requests: { cpu: "50m", memory: "100Mi" } }
                        }]
                    }
        }
    }
});