# Encryption

TeamsPlus encryption is a useless service, but it can still be used if you want I guess.

## Encrypting and decrypting

You first need an account. Go create one at [https://apiteamsplus.pythonanywhere.com/register](https://apiteamsplus.pythonanywhere.com/register). Please remember your encryption key when signing up as there is no way to recover them if you forget them.

**How to encrypt**

1. Click on the lock button in the sidebar.
2. Search for an account and select the one you want to encrypt for.
3. Type the content you want to encrypt
4. Press encrypt. A *enter your password* popup should popup.
5. Enter your encryption key associated with your account. If you forgot them, please see *I forgot my encryption key please help* section.
6. A login popup will appear if needed. Simply enter your credentials. 
7. The encrypted message will be shown on the bottom and copied to your clipboard (if available).
8. Send the ciphertext to the destinated person. A *decrypt* button should appear below all encrypted messages.

If you got *Internal server error* message, it may mean:

- Invalid login credentials or encryption key.
- Missing data or invalid request to the server
- Any other server error

**How to decrypt**

1. Click the *decrypt* button on a message.
2. Enter the encryption key associated with YOUR ACCOUNT. If you forgot them, please see *I forgot my encryption key please help* section.
3. A login screen will appear if needed. Simply enter your credentials to continue.
4. A popup with the decrypted content should appear.

If you got *Internal server error* message, it may mean:

- Invalid login credentials or encryption key.
- Invalid message format or missing data/field.
- Message authenticity cannot be verified.
- Message cannot be decrypted with your keys or not meant to be read by you.
- Any other server error


## I forgot my encryption key please help

**There is no way to recover your encryption key.** The encryption key is needed to decrypt the real encryption key associated with your account. Without this key, we (TeamsPlus) are unable to decrypt any message you sent and destined to you.
