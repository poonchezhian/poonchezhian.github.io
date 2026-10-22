<!-- Markdown version of https://poonchezhian.github.io/guides/ssh-ec2-ssm-putty/ . Updated 2026-10-22. The HTML page is the canonical version. -->

# How to SSH into an EC2 instance over SSM from Windows with PuTTY

You can reach an EC2 server with port 22 closed by sending SSH through AWS Systems Manager Session Manager. This guide shows the manual way, step by step, so you know exactly what happens. The last section shows the shortcut.

## Before you start

- The instance runs the SSM Agent and has an IAM instance profile that allows Systems Manager (for example `AmazonSSMManagedInstanceCore`).
- You have the AWS CLI version 2 and the Session Manager plugin installed on your PC.
- Your AWS identity is allowed to run `ssm:StartSession` on that instance.
- You have the key pair for the instance, converted to a `.ppk` file for PuTTY (PuTTYgen does this).

## 1. Sign in to AWS

If your company uses IAM Identity Center (AWS SSO), sign in with your profile name. A browser window opens for the company sign-in.

Command prompt

```
> aws sso login --profile prod
```

## 2. Check that the instance is ready

The instance must show as online in Systems Manager. If it is missing from the list, the agent or the role is the usual cause.

Command prompt

```
> aws ssm describe-instance-information --profile prod ^
    --query "InstanceInformationList[].[InstanceId,PingStatus,PlatformName]" --output table
```

## 3. Start the tunnel

This forwards port 2222 on your PC to port 22 on the instance. Replace the instance ID with yours. Leave this window open for as long as you want the connection.

Command prompt

```
> aws ssm start-session --profile prod --target i-0a1b2c3d4e5f67890 ^
    --document-name AWS-StartPortForwardingSession ^
    --parameters "portNumber=22,localPortNumber=2222"
```

On success the window shows Waiting for connections...

## 4. Connect with PuTTY

Open PuTTY and set Host Name to `127.0.0.1` and Port to `2222`, with the connection type set to SSH. Under Connection, SSH, Auth, Credentials, choose your `.ppk` file. Click Open and log in with the user name for your image, such as `ec2-user` on Amazon Linux or `ubuntu` on Ubuntu.

When you are done, close PuTTY and press Ctrl+C in the tunnel window. For a second server, use a different local port, for example 2223.

## If something goes wrong

- **TargetNotConnected:** the SSM Agent is not running, the instance profile is missing, or the instance cannot reach the Systems Manager endpoints.
- **SessionManagerPlugin is not found:** install the Session Manager plugin and open a new command prompt.
- **Port already in use:** pick another local port, such as 2223.
- **PuTTY says the server refused the key:** check the user name and that the `.ppk` matches the key pair on the instance.

## The shortcut

Steps 1 to 4 repeat for every server and every day. [SSMConnect](https://poonchezhian.github.io/) signs you in, lists the servers that are ready, picks a free local port, starts the tunnel and saves the PuTTY session, so a connection becomes one click. It also does the same for WinSCP, MobaXterm and Remote Desktop. On Linux the same idea gives every server a short name, so `ssh ssc-web-prod` just works.

[Download SSMConnect for Windows](https://github.com/poonchezhian/ssmconnect/releases/latest/download/SSMConnect-Setup-x64.exe) · [Download for Linux](https://github.com/poonchezhian/ssmconnect/releases/download/linux-latest/ssmconnect-linux-x86_64.bin) · [See how it works](https://poonchezhian.github.io/)

Command lines use the Windows command prompt. In PowerShell, quote the parameters as shown. In a Linux or macOS shell, use a backslash instead of ^ to continue a line.


Next: [copy files between two servers the easy way](/file-transfer/), or read [SSM port forwarding explained](/blog/ssm-port-forwarding-explained/).
