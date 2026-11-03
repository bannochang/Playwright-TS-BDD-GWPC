@Account @PolicyCenter
Feature: PolicyCenter Account Management

 @TC_ACCOUNT_001
Scenario: Create a new company account
  Given I am logged in to Guidewire PolicyCenter
  When the user opens the Account menu
  And the user selects New Account
  And the user enters the company name
  And the user clicks the Search button
  And the user selects Company Account
  And the user enters the Company Account details
  And the user clicks the Update button
  Then the user saves the created Account Number