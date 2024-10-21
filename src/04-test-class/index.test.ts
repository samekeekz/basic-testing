import {
  getBankAccount,
  InsufficientFundsError,
  TransferFailedError,
  SynchronizationFailedError,
} from './index';
import { random } from 'lodash';

jest.mock('lodash', () => ({
  random: jest.fn(),
}));

describe('BankAccount', () => {
  test('should create account with initial balance', () => {
    const account = getBankAccount(100);
    expect(account.getBalance()).toBe(100);
  });

  test('should throw InsufficientFundsError when withdrawing more than balance', () => {
    const account = getBankAccount(100);
    expect(() => account.withdraw(200)).toThrow(InsufficientFundsError);
  });

  test('should throw TransferFailedError when transferring more than balance', () => {
    const accountA = getBankAccount(100);
    const accountB = getBankAccount(50);
    expect(() => accountA.transfer(200, accountB)).toThrow(
      InsufficientFundsError,
    );
  });

  test('should throw TransferFailedError when transferring to the same account', () => {
    const account = getBankAccount(100);
    expect(() => account.transfer(50, account)).toThrow(TransferFailedError);
  });

  test('should deposit money', () => {
    const account = getBankAccount(100);
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  test('should withdraw money', () => {
    const account = getBankAccount(100);
    account.withdraw(50);
    expect(account.getBalance()).toBe(50);
  });

  test('should transfer money', () => {
    const accountA = getBankAccount(100);
    const accountB = getBankAccount(50);
    accountA.transfer(50, accountB);
    expect(accountA.getBalance()).toBe(50);
    expect(accountB.getBalance()).toBe(100);
  });

  test('fetchBalance should return number if request did not fail', async () => {
    (random as jest.Mock).mockReturnValueOnce(1); // Simulate successful request
    const account = getBankAccount(100);
    const balance = await account.fetchBalance();
    expect(typeof balance).toBe('number');
  });

  test('should set new balance if fetchBalance returned number', async () => {
    (random as jest.Mock).mockReturnValueOnce(50); // Simulate request success and a returned balance of 50

    const account = getBankAccount(100);
    await account.synchronizeBalance();

    expect(account.getBalance()).toBe(50); // Expect new balance to be 50
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    (random as jest.Mock)
      .mockReturnValueOnce(0) // Simulate request failure
      .mockReturnValueOnce(0); // Simulate balance check fails

    const account = getBankAccount(100);

    await expect(account.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
  });
});
