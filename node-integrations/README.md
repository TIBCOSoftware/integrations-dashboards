# Node Integrations

## 1. Setup

You will need a few prerequisites before you can run this repository.

1. Download the latest version of NodeJS from https://nodejs.org/en/download/.
2. Download the TIBCO® Cloud - Command Line Interface from https://integration.cloud.tibco.com/download.
   1. Login with your AD credentials. Go to the downloads section.
   2. After downloading, you will need to add the tibcli to your path. If you are on Mac, run `echo $PATH`. Pick one of the directories and place the tibcli file there.
   3. Run `tibcli -v`. Ensure that you don't see any errors.
3. Once you have the prerequisities complete, make a clone of this repository to your local machine.
4. Run `npm install`.
5. In order for BOSS and JEFE Salesforce integrations to work, you will need to add the credentials to your environment variables. The easiest way is to ask another team member for a copy of their .env file. Place the .env file in the top level directory of this project.
6. Run `npm run start` to initialize the project.

## 2. Deploying

To deploy, first run the following script:

`npm run build -- {environment}`

Environment can either be development, production, or sandbox. Once all assets are built, you can run the following argument:

`npm run deploy -- {environment} [${taskName}]`

Environment valid options are the same as in the previous command. Task name can be any of the entries found in tasks/taskList.js. If you do not specify a taskName, every single task will be pushed one by one to TIBCO Cloud /Integration.

If you receive any issues, you will need to login to your user. You can enter your credentials in the prompt, or run `tibcli login` to login manually.

NOTE: Currently the build stage will only work on machines running a bash shell, as it utilizes a native bash zipping command.

## 2. Wish List

This is a running list of items that need to be completed, in order of priority.

- Setup environmental variables on TIBCO Cloud.
- Set-up gitflow
- Unit tests
- Jenkins CD/CI