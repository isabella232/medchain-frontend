# 1. Medchain Administration UI

The project goal was to create an administration interface for the access control and auditability system [MedChain](https://github.com/ldsec/medchain). 
    
By using the administration interface, administrators are able to collectively govern the MedChain ecosystem. They collectively manage the MedChain Administrator Consortium. They decide the set of keys belonging to the consortium and the collective signature policy. They also manage the access rights of the researchers that use the privacy-preserving analysis and sharing system of sensitive medical data MedCo \cite{medco}.
    
The administration interface developed during this project is operational and can already be deployed in the MedChain ecosystem. Some improvements and iterations will probably be needed in the future to increase performances and user experience. The application is very lightweight and operates at a low level of abstraction with the underlying Byzcoin data store. This will ease the addition of features in the future.

# 2. Table of Content

- [1. Medchain Administration UI](#1-medchain-administration-ui)
- [2. Table of Content](#2-table-of-content)
- [3. Setup](#3-setup)
  - [3.1. Setup a Byzcoin chain](#31-setup-a-byzcoin-chain)
    - [3.1.1. Install medchain](#311-install-medchain)
    - [3.1.2. Start the byzcoin chain](#312-start-the-byzcoin-chain)
  - [3.2. Setup the app](#32-setup-the-app)
    - [3.2.1. Install all the dependencies](#321-install-all-the-dependencies)
    - [3.2.2. Add the correct roster file](#322-add-the-correct-roster-file)
    - [3.2.3. npm run start to start the application](#323-npm-run-start-to-start-the-application)
    - [3.2.4. Build the project](#324-build-the-project)
- [4. Organization](#4-organization)
  - [4.1. Classes](#41-classes)
  - [4.2. Components](#42-components)
    - [4.2.1. Administration](#421-administration)
    - [4.2.2. Projects](#422-projects)
    - [4.2.3. Transactions](#423-transactions)
    - [4.2.4. Other components](#424-other-components)
  - [4.3. Services](#43-services)
  - [4.4. Hooks](#44-hooks)
  - [4.5. Packages](#45-packages)
  - [4.6. Limitations](#46-limitations)
  
# 3. Setup

Below we detail how you can setup a local roster of nodes running a Byzcoin blockchain.

## 3.1. Setup a Byzcoin chain

### 3.1.1. Install medchain

**You need to have the latest version of the Medchain administration cothority service**

```sh
git clone https://github.com/ldsec/medchain.git
cd medchain

```

-----------

### 3.1.2. Start the byzcoin chain

**Install bcadmin, the byzcoin CLI**

The Byzcoin CLI allows you to interact with the byzcoin blockchain with a low level of overhead.

```sh
git clone https://github.com/dedis/cothority.git
cd cothority/byzcoin/bcadmin
go install
```

**Start the proxy**

The Bypros proxy allows you to fetch data from Byzcoin by sending SQL queries to the Bypros proxy server. Still in the Medchain repository you need to lauch the Bypros service by running:

```sh
cd bypros
docker-compose up
```


**Start the conodes**

Then, when you launch the conode, export the needed variables for the proxy. The proxy needs two URLs to connect to the database: one with read/write, and another one with read-only access.
```sh
 # user/password are set in the dockerfile (root) and the schema (read-only user).
export PROXY_DB_URL=postgres://bypros:docker@localhost:5432/bypros
export PROXY_DB_URL_RO=postgres://proxy:1234@localhost:5432/bypros
```

```sh
cd conode
# it will fail if the PROXY_DB_URL* variables are not set!
go build -o conode && ./run_nodes.sh -v 3 -d tmp
```

This command will setup 3 nodes and save their files in conode/tmp.

**Setup the Byzcoin genesis DARC for Medchain**

Once the nodes are running, you may want to create a new skipchain, and perform
basic operations like updating the DARC. This can be done with
[bcadmin](https://github.com/dedis/cothority/tree/master/byzcoin/bcadmin), the
Byzcoin CLI.

We created a script that allow you to setup the Byzcoin DARC to be ready for running the administration interface.

If you did not already created a new skipchain running

```sh
# Tells bcadmin where the config folder is
export BC_CONFIG=conode/tmp 
# Create a new skipchain
bcadmin create $BC_CONFIG/public.toml
```

Then export the Byzcoin chain configuration environment variable.

```sh
# Tells bcadmin about the new skipchain configuration
export BC=...
```

Then you need to export the administrator key in the `BC_ADMIN_ID` environment variable. To know the identity of the administrator run:

```sh
# Tells bcadmin about the new skipchain configuration
bcadmin info
- Config:
-- Roster:
--- tls://localhost:7774
--- tls://localhost:7772
--- tls://localhost:7770
-- ByzCoinID: 3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb
-- AdminDarc: 08cc267ced3d8d248e351d6f8f33f3962020e082cf01a960da08279b9bb91d60
-- Identity: ed25519:936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f
- BC: /Users/jean/Library/Application Support/bcadmin/data/bc-3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb.cfg
```

Then export the identity:

```sh
# Tells bcadmin about the new skipchain configuration
export BC_ADMIN_ID=ed25519:936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f
```

Once done just run the `setup` command of the Makefile:

```sh
# Tells bcadmin about the new skipchain configuration
make setup
```

Once done you have the byzcoin genesis DARC setup to have all the rules needed for the Medchain administration

---------

## 3.2. Setup the app


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and the typescript template.

### 3.2.1. Install all the dependencies

```sh
npm install
```

### 3.2.2. Add the correct roster file

You first need to update `/src/services/roster.ts` to the correct roster, which can be found in `conode/tmp/public.toml` if you followed the instructions above.

You also want to copy the ID of the genesis DARC and the ByzcoinID into the `/src/services/roster.ts` file. 

```sh
# Tells bcadmin about the new skipchain configuration
bcadmin info
- Config:
-- Roster:
--- tls://localhost:7774
--- tls://localhost:7772
--- tls://localhost:7770
-- ByzCoinID: 3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb
-- AdminDarc: 08cc267ced3d8d248e351d6f8f33f3962020e082cf01a960da08279b9bb91d60
-- Identity: ed25519:936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f
- BC: path/to/.../bcadmin/data/bc-3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb.cfg
```

### 3.2.3. npm run start to start the application

```sh
npm run start
```

Once you started the project, you need to register the public and private key in order to interact with the chain. You need to click on the connect button of the app and register the keys.

You find the keys by using `bcadmin`. Get the info of Byzcoin first to get the identity of the first administrator generated when configuring the chain:

```sh
bcadmin info
- Config:
-- Roster:
--- tls://localhost:7774
--- tls://localhost:7772
--- tls://localhost:7770
-- ByzCoinID: 3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb
-- AdminDarc: 08cc267ced3d8d248e351d6f8f33f3962020e082cf01a960da08279b9bb91d60
-- Identity: ed25519:936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f
- BC: path/to/.../bcadmin/data/bc-3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb.cfg
```

And then get the public and private key pair

```sh
bcadmin key -print /path/to/.../bcadmin/data/key-ed25519:936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f.cfg
Private: ec553855272bb591cf1d32753baf44cbac75ec57513a771537aad157c2088706
Public: 936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f
```

Then you need to ask Bypros to follow the Byzcoin roster (for the queries to run). You only need to do it once for every restart of the bypros docker containers.

### 3.2.4. Build the project

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


```sh
npm run build
```



# 4. Organization

## 4.1. Classes

`classes.ts` export an object that defines CSS classes, for reusability of certain classes accross multiple components.

## 4.2. Components

### 4.2.1. Administration

Contains all the components of the Administration page

### 4.2.2. Projects

Contains all the components of the Projects page

### 4.2.3. Transactions

Contains all the components of the Transactions page

### 4.2.4. Other components

- `Buttons.tsx` defines the buttons of the application
- `ConnectModal.tsx` defines the modal for the connection (register of the public and private key pair)
- `Error.tsx` defines the error message component
- `PageLayout.tsx` is an outer order component that defines the wireframe for any page of the application
- `Pager.tsx` defines the pagination for the transactions page
- `PanelElement` defines a section of a box in the UI
- `Success.tsx` defines the success message component

## 4.3. Services

Contains all the different services used to communicate and manipulate the data of the app.

- `byprosQueries.ts` contains Bypros sql queries definitions
- `CothorityGateway.tsx` contains methods to communicate with Byzcoin.
- `CothorityTypes.ts` defines certain types used to wrap Cothority objects and used in the application
- `cothorityUtils.ts` contains helper methods for the different services.
- `instructionBuilder.ts` contains methods that prepare transaction for the `CothorityGateway.tsx`
- `messages.ts` contains protobuf to Typescript message definition. These messages are used to unmarshall data from Byzcoin.
- `roster.ts` contains all the connection details about the roster of conodes and the configuration of Byzcoin.

## 4.4. Hooks

`useLocalStorage.tsx` this hook is used by the `ConnectionContext` to store the public adn private key pair in the local storage of the web browser. 
> Note that this is a limitation. [see below](#limitations)
  
## 4.5. Packages

- [**TailwindCSS**](https://tailwindcss.com/): The CSS framework used for creating the styling of the project. The file `tailwind.config.js` is used to personalized the framework to add special styling and extend existing styles.
  > The documentation is incredible, you search anything in the search bar and you have all the different classes that you can use.
- [**React Tables**](https://react-table.tanstack.com/): Create tables with add-on functionalities like sorting, filtering...
- [**classnames**](https://www.npmjs.com/package/classnames) This package is usefull to separate the logic of the different classes you import. 
- [**@dedis/cothority**](https://www.npmjs.com/package/@dedis/cothority) package that provides methods used to communicate with Byzcoin
- [**React Icons**](https://react-icons.github.io/react-icons) used to import icons in the application. This package is just a repository of most of the famous SVG libraries. You just import the icon in the component and during the build of the project for production it will include the SVG in the final build.

## 4.6. Limitations

Note that this is a limitation. For production environment, this setup provide no security if the private key. A solution would be to encrypt the private key and store the ciphertext in a JSON file. And decrypt at runtime asking for the password of the administrator.