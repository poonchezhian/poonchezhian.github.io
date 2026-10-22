<!-- Markdown version of https://poonchezhian.github.io/blog/is-it-safe-to-copy-files-through-your-pc/ . Updated 2026-10-21. The HTML page is the canonical version. -->

# Is it safe to copy files between servers through your PC?

When a file travels from one server to another through your computer, a sensible person asks three questions: who can see it on the way, what is left behind, and what can the tool do on my servers? Here are the answers for the file window in [SSMConnect](/), including the limits.

## Who can see the file on the way

The path is server A, then the SSM tunnel, then your PC, then the second SSM tunnel, then server B.

- Both hops are carried by AWS Systems Manager, over the connection each server's SSM Agent already makes out to AWS. No inbound port is opened.
- The tunnel ends on `127.0.0.1` on your PC. SSMConnect checks that tunnels listen only on your own computer and closes a tunnel if it ever finds one reachable from the network.
- Inside the tunnel, the file window talks SSH to each server (SFTP for the default user, sudo-run commands after Switch user). So the content is protected by SSH between your PC and each server, on top of what AWS does.

One honest note: another user signed in to the same PC at the same moment could reach a local tunnel port. They would still need valid SSH credentials for the server, which is what protects it.

## What is left behind

- **On your PC:** nothing. The program reads a block from the source, writes it to the destination, and repeats. The blocks live in memory only while they pass through. No temporary copy is saved to disk.
- **On the servers:** the copied file at the destination, and nothing else. If you use **Switch user** with a sudo password, that password is handed to sudo through a short-lived private helper file that is removed when you close the window.
- **In the log:** the names of items that failed and the reason, for troubleshooting. Contents are never logged.

## What the tool can do on your servers

- It signs in with the server's saved key as the server's default user. SSMConnect stores no password and no key of its own. It points at the key file you already have.
- It never works as root. The window refuses the name `root`, and it also refuses any account that turns out to have root rights (uid 0).
- Acting as another user is done with `sudo -u`, so what that user may do is decided by the server's own sudo rules.
- Before replacing anything, it lists the names that already exist and waits for you to confirm.
- Both servers must belong to one sign-in organization. The window will not copy to a server outside it.

## The limits, stated plainly

- The window moves data through your PC, so it is as fast as your connection to AWS allows, and not suited to hundreds of gigabytes.
- There is no resume. An interrupted file starts again.
- It is for Linux servers over SSH. Windows servers use Remote Desktop.
- SSMConnect is an early release for Windows. The Windows installer is not code-signed yet, so SmartScreen may warn on first run, and you can compare the file's SHA-256 with the one on the release page.

## The short version

No new inbound ports, no copy kept on your disk, no root, and every step follows the permissions your AWS role and your server's sudo rules already give you. If your security team wants to read the code, it is public under the [Apache License 2.0](https://github.com/poonchezhian/ssmconnect), with a [private way to report a vulnerability](https://github.com/poonchezhian/ssmconnect/security/policy).

Read the full guide: [Copy files between servers](/docs/file-transfer/). To see the other protections, read [Security](/docs/security/).