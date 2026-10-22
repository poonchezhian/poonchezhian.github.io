<!-- Markdown version of https://poonchezhian.github.io/blog/connect-to-ec2-over-ssm-without-port-22/ . Updated 2026-10-22. The HTML page is the canonical version. -->

# Connect to an EC2 server over SSM without opening port 22

You have an EC2 server. You want a terminal on it. Somebody, wisely, closed port 22. This is the situation SSMConnect was built for: you still get PuTTY, WinSCP, MobaXterm or Remote Desktop, and the server keeps every inbound port closed.

## Why port 22 is closed, and why that is good

An open SSH port is reachable by the whole internet, and it is attacked all day long. Many teams close it and use AWS Systems Manager (SSM) Session Manager instead. The server's SSM Agent calls out to AWS, and AWS carries your connection back over that existing channel. No inbound port, no bastion host, no VPN.

The catch is that the usual way to use it is a long command line, plus a plugin, plus a port number you have to remember. If you are a developer who just wants to log in, that is a lot of plumbing. If you want to understand it first, read [SSM port forwarding explained](/blog/ssm-port-forwarding-explained/).

## What SSMConnect does for you

SSMConnect is a free Windows app (and a Linux app) that does the plumbing:

1. **Finds your servers.** Sign in once with your company sign-in and it lists the running servers in every AWS account under it, and marks which ones SSM can reach.
2. **Opens one tunnel per server.** Each server gets its own local port on `127.0.0.1`. The tunnels run as you, not as an administrator, and restart by themselves if they drop.
3. **Sets up your tools.** Linux servers get saved sessions called `SSC - <server name>` in PuTTY, WinSCP and MobaXterm. Windows servers open in Remote Desktop.
4. **Tells you the truth about the connection.** A server card turns green only when its tunnel is really up. If something is wrong, the card says what, in plain words.

## Your first connection in five steps

1. [Download SSMConnect for Windows](https://github.com/poonchezhian/ssmconnect/releases/latest/download/SSMConnect-Setup-x64.exe) and run the installer. It adds the AWS CLI and the Session Manager plugin if they are missing.
2. In the setup wizard, paste your company sign-in address and sign in once in the browser.
3. Tick the servers you want.
4. Point each Linux server at its key file. **Find key files on this PC** does most of the work.
5. Save. The tunnels start, and the dashboard shows your servers.

From then on, open PuTTY, WinSCP or MobaXterm and pick the session called `SSC - your server name`, or click **PuTTY**, **WinSCP** or **Remote Desktop** on the server's card.

## What you need on the AWS side

SSMConnect cannot give a server something it does not have. For a server to be reachable, it needs the SSM Agent running and an instance role such as `AmazonSSMManagedInstanceCore`. Your own AWS role needs `ec2:DescribeInstances`, `ssm:DescribeInstanceInformation` and `ssm:StartSession`. If a server shows up as not reachable, [For IT teams](/docs/for-it-teams/) lists exactly what to ask for.

## Production servers are marked

SSMConnect reads the `Environment` tag and shows a red **PROD** label on production servers, so you notice before you type a command. [Server types and tags](/docs/server-types-and-tags/) explains how to get the labels right.

## When something does not work

The most common problems have a plain fix: an expired sign-in (one click on **Sign in**), a missing key, or a server that is not yet registered with SSM. [Troubleshooting](/docs/troubleshooting/) walks through each.

## Once you are connected: copy files between servers

SSMConnect has one more trick. Once two servers are connected, **Servers > File transfer** opens two panes so you can copy files from one server to the other, again with port 22 closed. It is an extra on top of connecting, and it has its own write-up: [How to copy files between EC2 servers when port 22 is closed](/blog/copy-files-between-ec2-servers-port-22-closed/).

SSMConnect is an early release, so try it on a non-production server first.