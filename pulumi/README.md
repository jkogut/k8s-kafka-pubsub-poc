
1. Configure `pulumi` to use your secret consumer/producer images: (add `--secret` option to encrypt) 

```js
$ pulumi config set consImage gcr.io/${PROJECT_ID}/go-secret-kafka-consumer:1.0.0
$ pulumi config set prodImage gcr.io/${PROJECT_ID}/go-secret-kafka-producer:1.0.0
```

2. First `prview` deployment: 
```js
$ pulumi preview
Previewing update (dev):

     Type                                         Name                                     Plan       
 +   pulumi:pulumi:Stack                          kafka-dev                                create     
 +   ├─ kubernetes:helm.sh:Chart                  kafka                                    create     
 +   │  ├─ kubernetes:core:ConfigMap              kafka-config                             create     
 +   │  ├─ kubernetes:core:Service                kafka                                    create     
 +   │  ├─ kubernetes:core:Service                kafka-headless                           create     
 +   │  ├─ kubernetes:core:Pod                    kafka-test-topic-create-consume-produce  create     
 +   │  ├─ kubernetes:batch:Job                   kafka-config-73bc2af5                    create     
 +   │  └─ kubernetes:apps:StatefulSet            kafka                                    create     
 +   ├─ kubernetes:helm.sh:Chart                  zookeeper                                create     
 +   │  ├─ kubernetes:core:Service                zookeeper                                create     
 +   │  ├─ kubernetes:policy:PodDisruptionBudget  zookeeper                                create     
 +   │  ├─ kubernetes:core:Service                zookeeper-headless                       create     
 +   │  └─ kubernetes:apps:StatefulSet            zookeeper                                create     
 +   ├─ kubernetes:apps:Deployment                go-producer                              create     
 +   └─ kubernetes:apps:Deployment                go-kafka-consumer                        create     
 
Resources:
    + 15 to create
```

3. Proceed with `pulumi up`, and choose **yes**:
```js
Do you want to perform this update? yes
Updating (dev):

     Type                                         Name                                     Status      
 +   pulumi:pulumi:Stack                          kafka-dev                                created     
 +   ├─ kubernetes:helm.sh:Chart                  zookeeper                                created     
 +   │  ├─ kubernetes:policy:PodDisruptionBudget  zookeeper                                created     
 +   │  ├─ kubernetes:core:Service                zookeeper                                created     
 +   │  ├─ kubernetes:core:Service                zookeeper-headless                       created     
 +   │  └─ kubernetes:apps:StatefulSet            zookeeper                                created     
 +   ├─ kubernetes:helm.sh:Chart                  kafka                                    created     
 +   │  ├─ kubernetes:core:ConfigMap              kafka-config                             created     
 +   │  ├─ kubernetes:core:Pod                    kafka-test-topic-create-consume-produce  created     
 +   │  ├─ kubernetes:core:Service                kafka                                    created     
 +   │  ├─ kubernetes:core:Service                kafka-headless                           created     
 +   │  ├─ kubernetes:batch:Job                   kafka-config-73bc2af5                    created     
 +   │  └─ kubernetes:apps:StatefulSet            kafka                                    created     
 +   ├─ kubernetes:apps:Deployment                go-kafka-consumer                        created     
 +   └─ kubernetes:apps:Deployment                go-producer                              created     
 
Resources:
    + 15 created

Duration: 4m20s
```


4. Check if producer/consumer are working:
```js
$ kubectl logs go-producer-6cndtvr9-7b87b4c5f9-vl99t
Message is stored in topic(golang-topic)/partition(3)/offset(90)
Message is stored in topic(golang-topic)/partition(4)/offset(94)
Message is stored in topic(golang-topic)/partition(3)/offset(91)
Message is stored in topic(golang-topic)/partition(0)/offset(91)
Message is stored in topic(golang-topic)/partition(4)/offset(95)
Message is stored in topic(golang-topic)/partition(7)/offset(86)
Message is stored in topic(golang-topic)/partition(3)/offset(92)

$ kubectl logs go-kafka-consumer-hck9t8ad-5b4b65995-txn8r
Received messages  Hello Kafka 95
Received messages  Hello Kafka 96
Received messages  Hello Kafka 98
Received messages  Hello Kafka 101
Received messages  Hello Kafka 106
Received messages  Hello Kafka 111
Received messages  Hello Kafka 117
Received messages  Hello Kafka 127
```
