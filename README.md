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
- [4. Functionalities walkthrough](#4-functionalities-walkthrough)
  - [4.1. Register user keys](#41-register-user-keys)
  - [4.2. Administration Panel](#42-administration-panel)
    - [4.2.1. Add an administrator](#421-add-an-administrator)
    - [4.2.2. Remove an administrator](#422-remove-an-administrator)
    - [4.2.3. Modify the multi-signature rule policy](#423-modify-the-multi-signature-rule-policy)
    - [4.2.4. Modify an administrator identity](#424-modify-an-administrator-identity)
  - [4.3. Transactions Panel](#43-transactions-panel)
    - [4.3.1. Sign and execute a transaction](#431-sign-and-execute-a-transaction)
    - [4.3.2. View the past executed transactions](#432-view-the-past-executed-transactions)
  - [4.4. Projects Panel](#44-projects-panel)
    - [4.4.1. Create a new project](#441-create-a-new-project)
    - [4.4.2. Add a user to a project](#442-add-a-user-to-a-project)
    - [4.4.3. Add rights to a user](#443-add-rights-to-a-user)
    - [4.4.4. remove rights from a user](#444-remove-rights-from-a-user)
- [5. Organization](#5-organization)
  - [5.1. Classes](#51-classes)
  - [5.2. Components](#52-components)
    - [5.2.1. Administration](#521-administration)
    - [5.2.2. Projects](#522-projects)
    - [5.2.3. Transactions](#523-transactions)
    - [5.2.4. Other components](#524-other-components)
  - [5.3. Services](#53-services)
  - [5.4. Hooks](#54-hooks)
  - [5.5. Packages](#55-packages)
  - [5.6. Limitations](#56-limitations)
 
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
# In the medchain repository
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
# In the medchain repository
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
# Still in the medchain repository
export BC_CONFIG=conode/tmp # Tells bcadmin where the config folder is
bcadmin create $BC_CONFIG/public.toml # Create a new skipchain
```

The **previous** command will ouput directly the command you need to execute to export the configuration path for the newly created skipchain:

```sh
export BC="conode/tmp/bc-722eac63e67c60ac4a1fc97905cce835e2ccce13613da626c1216c4510b8bb93.cfg"
```

Then you need to export the administrator key in the `BC_ADMIN_ID` environment variable. To know the identity of the administrator run:

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
- BC: /Users/jean/Library/Application Support/bcadmin/data/bc-3db1f3a8ebba3bc83009ae2daa12455b1d88b2e00b399abd7f101ec9483a6afb.cfg
```

Then export the identity:

```sh
export BC_ADMIN_ID=ed25519:936603dbfc52ae05513f102b7205b48390a5bd0eda578fcfb523c071157b0f9f
```

Now you need to go to the medchain administration ui repository:

```sh
cd path/to/medchain-frontend
```

Once done just run the `setup` command of the Makefile:

```sh
# In the medchain-frontend repository
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

You first need to update `/src/services/roster.ts` to the correct roster, which can be found in `conode/tmp/public.toml` file in the medchain repository (See the [instructions above](#312-start-the-byzcoin-chain)).

You also want to copy the ID of the genesis DARC and the ByzcoinID into the `/src/services/roster.ts` file. 

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

![Follow Byzcoin Proxy](screens/follow-proxy.png)


### 3.2.4. Build the project

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


```sh
npm run build
```

# 4. Functionalities walkthrough

## 4.1. Register user keys

When you first log into the application, you need to register your public and private key pair in order to sign transactions and interact with Byzcoin.

![Register user keys](screens/keys.png)

## 4.2. Administration Panel

The administration panel is the page where administrator come to manage the administrator consortium.

![Administration Panewl](screens/administration.png)

### 4.2.1. Add an administrator

Administrators can register a new administrator in the administrator consortium.

![Add an administrator](screens/administration-add.png)

### 4.2.2. Remove an administrator

Administrators can remove an administrator identity.

![Remove an administrator](screens/administration-remove.png)

### 4.2.3. Modify the multi-signature rule policy

Administrators can modify the multisignature rule that transactions need to comply with in order for them to be executed.

![Modify multi signature rule](screens/administration-multisig.png)

### 4.2.4. Modify an administrator identity

Administrators can also modify another administrator identity (ex: if the administrator lost access to his keys).

![Modify identity](screens/administration-edit.png)

## 4.3. Transactions Panel

Administrators come to the transactions panel to sign and execute all pending deferred transactions

![Transactions panel](screens/transactions.png)

### 4.3.1. Sign and execute a transaction

![Transactions sign and execute](screens/signExecute.png)

### 4.3.2. View the past executed transactions

In the history panel they can have a view of past executed transactions. They use that panel for audit purposes.

![Transaction History](screens/transactions-history.png)

## 4.4. Projects Panel

The projects panel is the page where the administrators manage the different dataset access rights. 

![Projects panel](screens/projects.png)

### 4.4.1. Create a new project 

They can create a new project.

![Add a new porject](screens/projects-add.png)

### 4.4.2. Add a user to a project

They can add user to a project and give them access rights.

![Add user to project](screens/projects-add-user.png)

### 4.4.3. Add rights to a user

They can also add other access rights to an existing user.

![Add right to user](screens/project-add-rights.png)

### 4.4.4. remove rights from a user

They can also revoke the access rights of a user for a specific project.

![Remove rights from user](screens/project-remove-rights.png)

# 5. Organization

## 5.1. Classes

`classes.ts` export an object that defines CSS classes, for reusability of certain classes accross multiple components.

## 5.2. Components

### 5.2.1. Administration

Contains all the components of the Administration page

### 5.2.2. Projects

Contains all the components of the Projects page

### 5.2.3. Transactions

Contains all the components of the Transactions page

### 5.2.4. Other components

- `Buttons.tsx` defines the buttons of the application
- `ConnectModal.tsx` defines the modal for the connection (register of the public and private key pair)
- `Error.tsx` defines the error message component
- `PageLayout.tsx` is an outer order component that defines the wireframe for any page of the application
- `Pager.tsx` defines the pagination for the transactions page
- `PanelElement` defines a section of a box in the UI
- `Success.tsx` defines the success message component

## 5.3. Services

Contains all the different services used to communicate and manipulate the data of the app.

- `byprosQueries.ts` contains Bypros sql queries definitions
- `CothorityGateway.tsx` contains methods to communicate with Byzcoin.
- `CothorityTypes.ts` defines certain types used to wrap Cothority objects and used in the application
- `cothorityUtils.ts` contains helper methods for the different services.
- `instructionBuilder.ts` contains methods that prepare transaction for the `CothorityGateway.tsx`
- `messages.ts` contains protobuf to Typescript message definition. These messages are used to unmarshall data from Byzcoin.
- `roster.ts` contains all the connection details about the roster of conodes and the configuration of Byzcoin.

## 5.4. Hooks

`useLocalStorage.tsx` this hook is used by the `ConnectionContext` to store the public adn private key pair in the local storage of the web browser. 
> Note that this is a limitation. [see below](#limitations)
  
## 5.5. Packages

- [**TailwindCSS**](https://tailwindcss.com/): The CSS framework used for creating the styling of the project. The file `tailwind.config.js` is used to personalized the framework to add special styling and extend existing styles.
  > The documentation is incredible, you search anything in the search bar and you have all the different classes that you can use.
- [**React Tables**](https://react-table.tanstack.com/): Create tables with add-on functionalities like sorting, filtering...
- [**classnames**](https://www.npmjs.com/package/classnames) This package is usefull to separate the logic of the different classes you import. 
- [**@dedis/cothority**](https://www.npmjs.com/package/@dedis/cothority) package that provides methods used to communicate with Byzcoin
- [**React Icons**](https://react-icons.github.io/react-icons) used to import icons in the application. This package is just a repository of most of the famous SVG libraries. You just import the icon in the component and during the build of the project for production it will include the SVG in the final build.

## 5.6. Limitations

Note that this is a limitation. For production environment, this setup provide no security if the private key. A solution would be to encrypt the private key and store the ciphertext in a JSON file. And decrypt at runtime asking for the password of the administrator.