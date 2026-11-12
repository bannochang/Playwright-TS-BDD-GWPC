@NewBusiness @CommercialAuto

Feature: Create and issue a new Commercial Auto policy
  As a user, I want to create a new Commercial Auto submission
  in Guidewire PolicyCenter,
  so that I can initiate and complete the insurance process for a new account.

  @TC_CA_NewBusiness_001
  Scenario: Create a new account and complete a Commercial Auto policy submission
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
    And the user selects an effective date
    And the user enters the commercial account details
    And the user enters the Coverage details
    And the user adds a vehicle with valid vehicle details
    And the user adds a driver with valid driver details
    And the user selects the required coverages
    And the user completes the underwriting information
    And the user requests a policy quote
    Then the quote should be generated successfully
    And the user issues the policy
    Then the policy status should be "Issued"
    And the policy number should be generated