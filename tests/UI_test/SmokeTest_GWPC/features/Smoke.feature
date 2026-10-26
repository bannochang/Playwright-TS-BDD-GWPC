@GWPC @CommercialAuto @Smoke
Feature: Commercial Auto Policy Smoke Testing

  As a Guidewire PolicyCenter user
  I want to verify the Commercial Auto policy lifecycle
  So that I can confirm the core functionality is operational

  Background:
    Given I am logged in to Guidewire PolicyCenter
    And I have access to the Commercial Auto line of business

  @CA_SMK_001
  Scenario: Verify Commercial Auto submission availability
    When I start a new submission
    And I select the Commercial Auto product
    Then the Commercial Auto submission wizard should open
    And the submission should be in progress

  @CA_SMK_002
  Scenario: Create a Commercial Auto submission
    Given I have an in-progress Commercial Auto submission
    When I enter the required account information
    And I enter the policy effective date
    And I complete the required submission details
    Then the submission details should be saved successfully

  @CA_SMK_003
  Scenario: Add vehicle and driver risk information
    Given I have an in-progress Commercial Auto submission
    When I add a valid commercial vehicle
    And I add the required driver information
    And I complete the required risk details
    Then the vehicle and driver information should be saved
    And no unexpected validation errors should be displayed

  @CA_SMK_004
  Scenario: Generate a Commercial Auto quote
    Given I have completed the required submission information
    And all mandatory underwriting requirements are satisfied
    When I request a quote
    Then the quote should be generated successfully
    And the quoted premium should be displayed
    And the quote should have a valid status

  @CA_SMK_005
  Scenario: Bind and issue a Commercial Auto policy
    Given I have a valid quoted Commercial Auto submission
    And all required underwriting approvals are complete
    When I bind the policy
    And I complete the required issuance activities
    Then the policy should be issued successfully
    And a policy number should be assigned
    And the policy status should reflect issuance

  @CA_SMK_006
  Scenario: Retrieve the issued Commercial Auto policy
    Given a Commercial Auto policy has been issued
    When I search for the policy using its policy number
    Then the policy should be retrieved successfully
    And the policy details should be displayed
    And the policy should belong to the Commercial Auto line of business
