# Teaching-HEIGVD-RES-2020-Labo-Orchestra

## Admin

* **You can work in groups of 2 students**.
* It is up to you if you want to fork this repo, or if you prefer to work in a private repo. However, you have to **use exactly the same directory structure for the validation procedure to work**. 
* We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on Telegram / Teams, so that everyone in the class can benefit from the discussion.

## Objectives

This lab has 4 objectives:

* The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

* The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

* The third objective is to continue practicing with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in class). You will then have to run multiple containers based on these images.

* Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.


## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

* the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

* the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)


### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound         |
|------------|---------------|
| `piano`    | `ti-ta-ti`    |
| `trumpet`  | `pouet`       |
| `flute`    | `trulu`       |
| `violin`   | `gzi-gzi`     |
| `drum`     | `boum-boum`   |

### TCP-based protocol to be implemented by the Auditor application

* The auditor should include a TCP server and accept connection requests on port 2205.
* After accepting a connection request, the auditor must send a JSON payload containing the list of <u>active</u> musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab


You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 res/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d res/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 5 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d res/musician piano
$ docker run -d res/musician flute
$ docker run -d res/musician flute
$ docker run -d res/musician drum
```
When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.


## Task 1: design the application architecture and protocols

| #  | Topic |
| --- | --- |
|Question | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands? |
| | ![](images/diagram_archi.JPG) |
|Question | Who is going to **send UDP datagrams** and **when**? |
| | L'application *Musician* envoie des datagrammes UDP contenant les sons émis toutes les secondes dès le démarrage du container.|
|Question | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received? |
| | L'application *Auditor* écoute sur le port 4444 pour recevoir des datagrammes UDP et quand elle les reçoit, elle actualise sa liste de musiciens actifs. |
|Question | What **payload** should we put in the UDP datagrams? |
| | La payload envoyée avec les datagrammes est composée de l'identifiant unique du musicien (uuid) et du son qu'il émet. |
|Question | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures? |
| | Des données de type JSON sont envoyées. Celles-ci sont actualisées toutes les secondes dès que les musiciens envoient de nouveaux sons. Nous allons chercher les données JSON sur les musiciens actifs en nous connectant sur l'application *Auditor* via TCP.  |


## Task 2: implement a "musician" Node.js application

| #  | Topic |
| ---  | --- |
|Question | In a JavaScript program, if we have an object, how can we **serialize it in JSON**? |
| | Nous pouvons utiliser la méthode *JSON.stringify()*.  |
|Question | What is **npm**?  |
| | *npm* est un manager de paquets utilisé pour gérer les dépendances en JavaScript.  |
|Question | What is the `npm install` command and what is the purpose of the `--save` flag?  |
| | `npm install` permet d'installer les dépendances dans le répertoire *node_modules*. Le flag `--save` va permettre de sauvegarder les paquets installés dans la liste de dépendances *package.json*.   |
|Question | How can we use the `https://www.npmjs.com/` web site?  |
| | Nous pouvons y rechercher des paquets, c'est un peu le *Docker Hub* de npm.  |
|Question | In JavaScript, how can we **generate a UUID** compliant with RFC4122? |
| | Il faut utiliser le package `uuid` de npm : `import { v4 as uuidv4 } from 'uuid';`.  |
|Question | In Node.js, how can we execute a function on a **periodic** basis? |
| | On peut utiliser la méthode `setInterval()`.  |
|Question | In Node.js, how can we **emit UDP datagrams**? |
| | Nous émettons des datagrammes UDP avec `dgram` et un socket créé avec `dgram.createSocket('udp4')`. |
|Question | In Node.js, how can we **access the command line arguments**? |
| | Avec le code suivant : `process.argv[]` et entre les crochets l'index de position de l'argument que l'on souhaite récupérer.  |


## Task 3: package the "musician" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we **define and build our own Docker image**?|
| | Il faut créer un fichier Dockerfile dans lequel on précise l'image que l'on veut récupérer et le configurer correctement (copie des sources, répertoire de travail, commande à lancer, ...). Pour construire l'image, il faut utiliser la commande `docker build -t res/musician .` à l'endroit où se trouve le Dockerfile.  |
|Question | How can we use the `ENTRYPOINT` statement in our Dockerfile?  |
| | Il faut lui indiquer la commande à lancer au démarrage du container : `ENTRYPOINT ["node", "/opt/app/musician.js"]`  |
|Question | After building our Docker image, how do we use it to **run containers**?  |
| | Il faut utiliser la commande `docker run -d res/musician piano` pour que le container soit lancé avec l'instrument piano passé comme argument. |
|Question | How do we get the list of all **running containers**?  |
| | Il faut utiliser la commande `docker ps`.  |
|Question | How do we **stop/kill** one running container?  |
| | Il faut connaitre le nom du container, on peut le trouver avec la commande indiquée ci-dessus. Il faut ensuite utiliser la commande `docker stop <name>` pour stopper le container, ou `docker kill <name>` pour l'arrêter complétement.  |
|Question | How can we check that our running containers are effectively sending UDP datagrams?  |
| | On peut utiliser `tcpdump` ou Wireshark sur la bonne interface.   |


## Task 4: implement an "auditor" Node.js application

| #  | Topic |
| ---  | ---  |
|Question | With Node.js, how can we listen for UDP datagrams in a multicast group? |
| | Il faut d'abord *bind* le socket sur le port, puis il faut utiliser la méthode `addMembership()` avec l'adresse du groupe pour s'inscrire dans le groupe multicast.  |
|Question | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**?  |
| | Dans le cas de l'application *Auditor*, les sons sont utilisés en tant que clés et les instruments en tant que valeurs. Cela permet de chercher le son reçu dans la *Map* et de trouver l'instrument correspondant. |
|Question | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting?  |
| | On peut utiliser ce module avec `moment()`. Cela permet de formatter les dates et d'effectuer des opérations avec.  |
|Question | When and how do we **get rid of inactive players**?  |
| | On supprime les musiciens inactifs pendant 5 secondes en les supprimant de la liste. |
|Question | How do I implement a **simple TCP server** in Node.js?  |
| | On peut utiliser le module *net* de *npm*, qui fournit la méthode `createServer()`. Nous allons ensuite appeler `listen` pour écouter (ou `on` pour écrire). Il faut chaque fois préciser les ports utilisés.|


## Task 5: package the "auditor" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we validate that the whole system works, once we have built our Docker image? |
| | Le script *validate.sh* s'occupe de la validation du système. Sinon, une marche à suivre a été indiquée ci-dessus pour valider manuellement le bon fonctionnement du laboratoire. Il faut lancer le container avec l'application *Auditor* puis créer plusieurs containers avec des musiciens. Nous pouvons ensuite jouer avec le système pour vérifier que les musiciens transmettent bien les sons et que l'auditeur récupère bien les instruments joués. |


## Constraints

Please be careful to adhere to the specifications in this document, and in particular

* the Docker image names
* the names of instruments and their sounds
* the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should try to run it.