# Encryption

TeamsPlus encryption is optional, but you can use it if you want to keep your messages more private.

## Getting Started

Before encrypting or decrypting messages, you need an account. Sign up here: [https://apiteamsplus.pythonanywhere.com/register](https://apiteamsplus.pythonanywhere.com/register).  

!!! note
    Make sure to remember your encryption key when signing up. There is no way to recover it if you forget it.

## How to Encrypt

1. Click the lock button in the sidebar.
2. Search for the recipient's account and select it.
3. Type the content you want to encrypt.
4. Press **Encrypt**. A popup will ask you for your password.
5. Enter the encryption key linked to your account.  
   !!! tip
       If you forgot it, see the *I forgot my encryption key* section below.
6. Log in if prompted.
7. The encrypted message will appear at the bottom and, if possible, will be copied to your clipboard.
8. Send the ciphertext to the recipient. A **Decrypt** button will appear below all encrypted messages.

### Common Issues

!!! warning
    If you see an **Internal server error**, it may be due to:
    - Incorrect login credentials or encryption key.  
    - Missing or invalid data in the request.  
    - Temporary server issues.

## How to Decrypt

1. Click the **Decrypt** button on a message.
2. Enter your encryption key.  
   !!! tip
       If you forgot it, see the *I forgot my encryption key* section below.
3. Log in if prompted.
4. A popup will display the decrypted content.

### Common Issues

!!! warning
    If you see an **Internal server error**, it may be due to:
    - Incorrect login credentials or encryption key.  
    - Invalid message format or missing data.  
    - The message cannot be decrypted with your keys or was not intended for you.  
    - Temporary server issues.

## I Forgot My Encryption Key

!!! danger
    If you forget your encryption key, it cannot be recovered.

The encryption key is required to access the real encryption key for your account. Without it, TeamsPlus cannot decrypt messages you sent or that were sent to you.  

!!! tip
    Store your encryption key safely, for example in a password manager.
