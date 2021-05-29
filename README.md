# Medchain Administration UI

## Setup

### Setup a Byzcoin chain

#### Inatall medchain

**You need to have the latest version of the Medchain administration cothority service**

```sh
git clone https://github.com/ldsec/medchain.git
cd medchain

```

**Change to the `admin-refactored` branch**

```sh
git pull origin admin-refactored
git checkout admin-refactored
```

-----------

#### Start the byzcoin chain

**Install bcadmin, the byzcoin CLI**

```sh
git clone https://github.com/dedis/cothority
cd cothority/byzcoin/bcadmin
go install
```

**Start the proxy**

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

For instance we will setup the chain to have an admin darc that can setup some projects:

```sh
# Tells bcadmin where the config folder is
BC_CONFIG=conode/tmp 
# Create a new skipchain and output the Byzcoin chain ID that you can directly copy paste
bcadmin create $BC_CONFIG/public.toml
# Tells bcadmin about the new skipchain configuration
export BC=...
# Print the skipchain info, note the identity outputer. This is the public key of the first administrator
bcadmin info
# Print the admin key, which is stored at the same place specified by BC
bcadmin key -print path/to/BC/key-ed25519:e65...e30b89e239.cfg
# Add to the darc the ability to spawn deferred transactions
bcadmin darc rule -rule spawn:deferred -id <darcID> --identity <adminID>
# Add to the darc the ability to add signature to deferred transactions
bcadmin darc rule -rule invoke:deferred.addProof -id <darcID> --identity <adminID>
# Add to the darc the ability to execute deferred transactions
bcadmin darc rule -rule invoke:deferred.execProposedTx -id <darcID> --identity <adminID>
# Add a DARC rule to the genesis darc to spawn a project contract instance
bcadmin darc rule -rule spawn:project -id <darcID>
# Add a DARC rule to the genesis darc to update a project contract instance
bcadmin darc rule -rule spawn:project.update -id <darcID>
```

To add a threshold rule with bcadmin (for setting up multisignature rules)

```sh
bcadmin darc rule -rule spawn:project.update -id "threshold<2/3,ed25519:7378d7edf205714e77af5d878ce454464ce0560e3f1633d68fea6dd40bb30238>"
```

---------

### Setup the app


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and the typescript template.

#### Install all the dependencies

```sh
npm install
```

#### Add the correct roster file

You first need to update `/src/services/roster.ts` to the correct roster, which can be found in conode/tmp/public.toml if you followed the instructions above.

<!-- TODO  Add how to store the admin darc ID and the genesis DARC-->

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

