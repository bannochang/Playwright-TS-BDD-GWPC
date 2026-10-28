
@Smoke @CommercialAuto @PolicyCenter
Feature: Commercial Auto Policy Smoke Test

  As a Commercial Auto underwriter
  I want to create and issue a Commercial Auto policy
  So that I can verify the critical PolicyCenter functionality

  @TC_CA_SMOKE_001
  Scenario: Create and issue a new Commercial Auto policy
    When the user starts a new Commercial Auto submission
    And the user selects an effective date
    And the user enters the commercial account details
    And the user enters the commercial account details
    And the user adds a vehicle with valid vehicle details
    And the user adds a driver with valid driver details
    And the user selects the required coverages
    And the user completes the underwriting information
    And the user requests a policy quote
    Then the quote should be generated successfully
    And the user issues the policy
    Then the policy status should be "Issued"
    And the policy number should be generated
    And the issued policy should be available in PolicyCenter

  @TC_CA_SMOKE_002
  Scenario: Verify an issued Commercial Auto policy can be retrieved
    Given a Commercial Auto policy has been issued successfully
    When the user searches for the policy using its policy number
    Then the policy should be displayed
    And the policy status should be "Issued"
    And the insured account details should be displayed
    And the vehicle details should match the issued policy
