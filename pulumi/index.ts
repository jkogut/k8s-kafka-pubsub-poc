import * as k8s from "@pulumi/kubernetes";

// Deploy the latest version of the stable/kafka chart.
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
            config: "cleanup.policy=compact,delete.retention.ms=604800000" //<-- FIXME !!! 
            // [2019-03-11 16:28:29,253] ERROR Error when sending message to topic test-topic with key: null, value: 28 bytes with error: 
            // (org.apache.kafka.clients.producer.internals.ErrorLoggingCallback) org.apache.kafka.common.errors.CorruptRecordException: 
            // This message has failed its CRC checksum, exceeds the valid size, or is otherwise corrupt.
        },
        {   
            name: "test-topic2",
            partitions: 8,
            replicationFactor: 3
        },   
        {   
            name: "test-topic3",
            partitions: 8,
            replicationFactor: 3,
            defaultConfig: "segment.bytes,segment.ms"
        }   

    ],
        zookeeper: {
            // enabled: false,
            url: "kafka11"
        }
    }
});
