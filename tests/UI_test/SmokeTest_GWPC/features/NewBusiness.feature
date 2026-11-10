@NewBusiness @SmokeTest

Feature: Create a new Commercial Auto submission
  As a user, I want to create a new Commercial Auto submission 
  in Guidewire PolicyCenter, 
  so that I can initiate the insurance process for a new account.

    @TC_CA_NewBusiness_001
Scenario: Create a new Commercial Auto submission
  Given I am logged in to Guidewire PolicyCenter
  When the user opens the Account menu
  And the user selects New Account
  And the user enters the company name
  And the user clicks the Search button
  And the user selects Company Account
  And the user enters the Company Account details
  And the user clicks the Update button
  Then the user saves the created Account Number
  When the user starts a new Commercial Auto submission
  And the user enters the commercial account details