<!-- Markdown version of https://poonchezhian.github.io/blog/ssm-port-forwarding-explained/ . Updated 2026-10-20. The HTML page is the canonical version. -->

# SSM port forwarding explained for developers

If you are a developer and not an infrastructure person, "SSM port forwarding" sounds like something to leave to someone else. It is actually one idea, and once you have it the rest of Session Manager stops being mysterious.

## The idea

Your PC starts a small program that listens on a port on your own computer, for example `2201`. Anything that connects to `127.0.0.1:2201` is carried, through AWS Systems Manager, to a port on your server, usually port 22 for SSH or 3389 for Remote Desktop. The server never needed an open inbound port. It called out to AWS when its SSM Agent started, and AWS carries your traffic over that existing connection.

```
PuTTY  ->  127.0.0.1:2201  ->  AWS Systems Manager  ->  your server, port 22
```

## The command behind it

```
aws ssm start-session --target i-0a1b2c3d4e5f67890 ^
  --document-name AWS-StartPortForwardingSession ^
  --parameters "portNumber=22,localPortNumber=2201"
```

- `--target` is the instance ID of the server.
- `portNumber` is the port on the server you want to reach.
- `localPortNumber` is the port that opens on your PC.

The command keeps running. While it runs, the tunnel exists. Press Ctrl+C and it is gone. It needs the AWS CLI and the Session Manager plugin installed on your PC, and your AWS identity must be allowed `ssm:StartSession` on that instance.

## Why tools connect to 127.0.0.1

After the command starts, your server looks like it is on your own computer, at `127.0.0.1` with the local port you chose. So in PuTTY you type host `127.0.0.1` and port `2201`. In WinSCP the same. In Remote Desktop, `127.0.0.1:3390`. The tool does not know about AWS at all.

## One tunnel per server

Each server needs its own local port, because a port can lead to only one place. Server one on 2201, server two on 2202, and so on. This is the part people forget, and the reason a spreadsheet of ports appears in so many teams.

## What can go wrong

- **TargetNotConnected:** the SSM Agent is not running, the instance has no role that allows Systems Manager, or it cannot reach the Systems Manager endpoints.
- **Port already in use:** another program, or an older tunnel, already uses that local port. Choose another.
- **The session ends by itself:** AWS closes idle sessions after a limit your administrators set in the Session Manager preferences, 20 minutes by default.
- **The login is refused:** the tunnel only carries the connection. SSH still checks your key and user name, for example `ec2-user` or `ubuntu`.

## Where SSMConnect fits

[SSMConnect](/) does the bookkeeping: it signs you in, finds the servers that are ready, picks a free local port for each, keeps the tunnels open, restarts a tunnel if AWS ends it, and saves sessions in PuTTY, WinSCP and MobaXterm. It also uses the same tunnels for [copying files between two servers](/file-transfer/), which is the awkward job when port 22 is closed.

To do it by hand once and see every step, follow the [PuTTY guide](/guides/ssh-ec2-ssm-putty/).