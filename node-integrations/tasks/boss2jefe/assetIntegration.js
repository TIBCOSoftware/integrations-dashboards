const _ = require('lodash');
const util = require('util');
const { logInfo, logError } = require('../../util/logger');
const salesforce = require('../../services/salesforce');
const statements = require('../../db/statements');

class AssetIntegration {
  constructor() {
    this.jefeSalesforceConn = null;
    this.bossSalesforceConn = null;
  }

  async run() {
    this.jefeSalesforceConn = await salesforce.initJefeConnection();
    this.bossSalesforceConn = await salesforce.initBossConnection();

    const bossAssets = await salesforce.queryAll(this.bossSalesforceConn, statements.getBossAsset);

    for (const bossAsset of bossAssets) {
      logInfo(`Migrating data for BOSS Asset ID: ${bossAsset.Id}...`);

      await this.migrateAllAccounts(bossAsset);
      await this.migrateAllContacts(bossAsset);
      await this.migrateAllAddresses(bossAsset);

      logInfo(`Finish migrating data for BOSS Asset ID: ${bossAsset.Id}`);
    }
  }

  // #region Accounts
  async migrateAllAccounts(bossAsset) {
    const endUserAccount = _.get(bossAsset, 'Apttus_Config2__AccountId__r', {});
    const primaryPartnerAccount = _.get(bossAsset, 'Opportunity__r.Primary_Partner__r', {});
    const secondaryPartnerAccount = _.get(bossAsset, 'Opportunity__r.Secondary_Partner__r', {});

    await this.migrateAccount(endUserAccount);
    await this.migrateAccount(primaryPartnerAccount);
    await this.migrateAccount(secondaryPartnerAccount);
  }

  async migrateAccount(bossChildAccount) {
    if (_.isNil(bossChildAccount)) return;

    const bossParentId = bossChildAccount.ParentId;
    let createdJefeChildAccountId = null;

    if (_.isNil(bossChildAccount.JEFE_ID__c)) {
      createdJefeChildAccountId = await this.createJefeAccount(bossChildAccount);
      await this.updateBossAccount(bossChildAccount.Id, createdJefeChildAccountId);
    }

    if (!_.isNil(bossParentId)) {
      let createdJefeParentAccountId = null;
      const bossParentAccount = await this.getBossAccount(bossParentId);

      if (_.isNil(bossParentAccount.JEFE_ID__c)) {
        createdJefeParentAccountId = await this.createJefeAccount(bossParentAccount);
        await this.updateBossAccount(bossParentAccount.Id, createdJefeParentAccountId);
      }

      const jefeChildAccountId = bossChildAccount.JEFE_ID__c || createdJefeChildAccountId;
      const jefeParentAccountId = bossParentAccount.JEFE_ID__c || createdJefeParentAccountId;

      if (!_.isNil(jefeParentAccountId)) {
        await this.updateJefeChildAccountWithParentId(jefeChildAccountId, jefeParentAccountId);
      }
    }
  }

  async createJefeAccount(bossAccount) {
    const recordTypeId = await this.getJefeRecordType(bossAccount.RecordType.Name);

    try {
      const jefeAccount = await this.jefeSalesforceConn.sobject('Account').create({
        BOSS_ID__c: bossAccount.Id,
        Name: bossAccount.Name,
        Type: bossAccount.Type,
        Website: bossAccount.Website,
        RecordTypeId: recordTypeId,
        LOB__c: bossAccount.LOB__c,
        Oracle_Account_Id__c: bossAccount.Oracle_Account_Id__c
      });

      return jefeAccount.id;
    } catch (error) {
      logError(error);

      return '';
    }
  }

  async getJefeRecordType(bossRecordTypeName) {
    try {
      const result = await this.jefeSalesforceConn.query(`SELECT Id FROM RecordType WHERE Name = '${bossRecordTypeName}'`);

      const { records } = result;

      return _.first(records).Id;
    } catch (error) {
      logError(error);
      return '';
    }
  }

  async updateBossAccount(bossAccountId, jefeAccountId) {
    try {
      await this.bossSalesforceConn.sobject('Account').update({
        Id: bossAccountId,
        JEFE_ID__c: jefeAccountId
      });

      logInfo(`BOSS Account Id #${bossAccountId} updated with JEFE Id #${jefeAccountId}`);
    } catch (error) {
      logError(error);
    }
  }

  async getBossAccount(bossId) {
    const statement = util.format(statements.getBossAccount, bossId);
    const result = await this.bossSalesforceConn.query(statement);
    const { records } = result;
    return _.first(records);
  }

  async updateJefeChildAccountWithParentId(jefeChildAccountId, jefeParentAccountId) {
    try {
      await this.jefeSalesforceConn.sobject('Account').update({
        Id: jefeChildAccountId,
        ParentId: jefeParentAccountId
      });

      logInfo(`JEFE Child Account Id #${jefeChildAccountId} updated with JEFE Parent Account Id #${jefeParentAccountId}`);
    } catch (error) {
      logError(error);
    }
  }
  // #endregion

  // #region Contact Migration
  async migrateAllContacts(bossAsset) {
    const primaryContact = bossAsset.Apttus_QPConfig__ProposalId__r.Apttus_Proposal__Primary_Contact__r;
    const endUserContact = bossAsset.Apttus_QPConfig__ProposalId__r.EndUser_Contact__r;
    const billToContact = bossAsset.Apttus_QPConfig__ProposalId__r.BillTo_Contact__r;
    const shipToContact = bossAsset.Apttus_QPConfig__ProposalId__r.ShipTo_Contact__r;

    const allContacts = [primaryContact, endUserContact, billToContact, shipToContact];
    const uniqueContacts = _.chain(allContacts)
      .filter(contact => !_.isNil(contact))
      .uniqBy(x => x.Id)
      .value();

    _.map(uniqueContacts, async contact => {
      await this.migrateContact(contact);
    });
  }

  async migrateContact(bossContact) {
    if (_.isNil(bossContact)) return;

    if (_.isNil(bossContact.JEFE_ID__c)) {
      const jefeContactId = await this.createJefeContact(bossContact);

      if (!_.isNil(jefeContactId)) {
        await this.updateBossContact(bossContact.Id, jefeContactId);
      }
    }
  }

  async createJefeContact(bossContact) {
    try {
      const jefeContact = await this.jefeSalesforceConn.sobject('Contact').create({
        BOSS_ID__c: bossContact.Id,
        Salutation: bossContact.Salutation,
        FirstName: bossContact.FirstName,
        LastName: bossContact.LastName,
        Title: bossContact.Title,
        Email: bossContact.Email,
        Phone: bossContact.Phone,
        AccountId: bossContact.Account.JEFE_ID__c
      });

      return jefeContact.id;
    } catch (error) {
      logError(error);

      return null;
    }
  }

  async updateBossContact(bossContactId, jefeContactId) {
    try {
      await this.bossSalesforceConn.sobject('Contact').update({
        Id: bossContactId,
        JEFE_ID__c: jefeContactId
      });

      logInfo('BOSS Contact Updated');
      logInfo(`BOSS ID: ${bossContactId}`);
      logInfo(`JEFE ID: ${jefeContactId}`);
    } catch (error) {
      logError(error);
    }
  }
  // #endregion

  // #region Address Migration
  async migrateAllAddresses(bossAsset) {
    const legalAddress = bossAsset.Apttus_QPConfig__ProposalId__r.Legal_To__r;
    const endUserAddress = bossAsset.Apttus_QPConfig__ProposalId__r.EndUser_Address__r;
    const billToAddress = bossAsset.Apttus_QPConfig__ProposalId__r.Bill_To__r;
    const shipToAddress = bossAsset.Apttus_QPConfig__ProposalId__r.Ship_To__r;

    const allAddresses = [legalAddress, endUserAddress, billToAddress, shipToAddress];
    const uniqueAddresses = _.chain(allAddresses)
      .filter(address => !_.isNil(address))
      .uniqBy(x => x.Id)
      .value();

    _.map(uniqueAddresses, async contact => {
      await this.migrateContact(contact);
    });
  }

  async migrateAddress(bossAddress) {
    if (_.isNil(bossAddress.JEFE_ID__c)) {
      const jefeAddressId = await this.createJefeAddress(bossAddress);

      if (!_.isNil(jefeAddressId)) {
        await this.updateBossAddress(bossAddress.Id, jefeAddressId);
      }
    }
  }

  async createJefeAddress(bossAddress) {
    try {
      const jefeAddress = await this.jefeSalesforceConn.sobject('Bill_To_Ship_To__c').create({
        BOSS_ID__c: bossAddress.Id,
        Street_1__c: bossAddress.Street_1__c,
        Street_2__c: bossAddress.Street_2__c,
        BOSS_Account_ID__c: bossAddress.AccountId, // remove if errors?
        City__c: bossAddress.City__c,
        Country_pl__c: bossAddress.Country__c,
        Country__c: bossAddress.Country__c,
        State_pl__c: bossAddress.State_pl__c,
        State__c: bossAddress.State_pl__c,
        Zip_Postal_Code__c: bossAddress.Zip_Postal_Code__c,
        VAT_Number__c: bossAddress.VAT_Number__c,
        Primary__c: false,
        Bill_To__c: true,
        Ship_To__c: true,
        Account__c: bossAddress.Account__r.JEFE_ID__c
      });

      return jefeAddress.id;
    } catch (error) {
      logError(error);

      return null;
    }
  }

  async updateBossAddress(bossAddressId, jefeAddressId) {
    try {
      await this.bossSalesforceConn.sobject('Bill_To_Ship_To__c').update({
        Id: bossAddressId,
        JEFE_ID__c: jefeAddressId
      });

      logInfo('BOSS Address Updated');
      logInfo(`BOSS ID: ${bossAddressId}`);
      logInfo(`JEFE ID: ${jefeAddressId}`);
    } catch (error) {
      logError(error);
    }
  }
  // #endregion
}

module.exports = new AssetIntegration();
