# Medchain Administration UI

The project goal was to create an administration interface for the access control and auditability system [MedChain](https://github.com/ldsec/medchain). 
    
By using the administration interface, administrators are able to collectively govern the MedChain ecosystem. They collectively manage the MedChain Administrator Consortium. They decide the set of keys belonging to the consortium and the collective signature policy. They also manage the access rights of the researchers that use the privacy-preserving analysis and sharing system of sensitive medical data MedCo \cite{medco}.
    
The administration interface developed during this project is operational and can already be deployed in the MedChain ecosystem. Some improvements and iterations will probably be needed in the future to increase performances and user experience. The application is very lightweight and operates at a low level of abstraction with the underlying Byzcoin data store. This will ease the addition of features in the future.

## Setup

Below we detail how you can setup a local roster of nodes running a Byzcoin blockchain.

### Setup a Byzcoin chain

#### Inatall medchain

**You need to have the latest version of the Medchain administration cothority service**

```sh
git clone https://github.com/ldsec/medchain.git
cd medchain

```

-----------

#### Start the byzcoin chain

**Install bcadmin, the byzcoin CLI**

The Byzcoin CLI allows you to interact with the byzcoin blockchain with a low level of overhead.

```sh
git clone https://github.com/dedis/cothority
cd cothority/byzcoin/bcadmin
go install
```

**Start the proxy**

The Bypros proxy allows you to fetch data from Byzcoin by sending SQL queries to the Bypros proxy server.

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
Byzcoin CLI:

```sh
# Tells bcadmin where the config folder is
BC_CONFIG=conode/tmp 
# Create a new skipchain
bcadmin create $BC_CONFIG/public.toml
# Tells bcadmin about the new skipchain configuration
export BC=...
# Print the skipchain info, useful to perform some operations later on
bcadmin info
# Print the admin key, which is stored at the same place specified by BC
bcadmin key -print .../key-ed25519\:...
# Add a DARC rule, the id can be found with 'bcadmin info'
bcadmin darc rule -rule spawn:project -id ed25519:...
```

We created a script that allow you to setup the Byzcoin DARC to be ready for running the administration interface.

If you did not already created a new skipchain running

```sh
# Tells bcadmin where the config folder is
BC_CONFIG=conode/tmp 
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

### Setup the app


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and the typescript template.

#### Install all the dependencies

```sh
npm install
```

#### Add the correct roster file

You first need to update `/src/services/roster.ts` to the correct roster, which can be found in conode/tmp/public.toml if you followed the instructions above.


#### npm run start to start the application

```sh
npm run start
```

#### Build the project

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


```sh
npm run build
```

