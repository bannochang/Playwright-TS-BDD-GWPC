
@Login @PolicyCenter
Feature: Guidewire PolicyCenter Login

  Scenario: Verify successful login to PolicyCenter
    Given I am logged in to Guidewire PolicyCenter
    Then the PolicyCenter home page should be displayed
    When the user opens the Account menu