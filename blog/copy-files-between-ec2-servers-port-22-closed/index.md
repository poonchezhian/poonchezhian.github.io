<!-- Markdown version of https://poonchezhian.github.io/blog/copy-files-between-ec2-servers-port-22-closed/ . Updated 2026-10-22. The HTML page is the canonical version. -->

# How to copy files between EC2 servers when port 22 is closed

Closing port 22 is one of the best security decisions you can make for an EC2 server. It also breaks the thing every developer does without thinking: `scp app.tar.gz other-server:/tmp/`. With no inbound SSH there is no `other-server` to reach, and the two servers often cannot see each other anyway.

If you reach your servers through AWS Systems Manager (SSM) Session Manager, you still have good options. This post compares four of them, shows the exact commands, and says honestly when each one is the right pick.

## The problem in one picture

You are signed in to AWS. Both servers are online in Systems Manager. You can open a shell on each. You need `app-2.4.1.tar.gz` to move from `web-prod-01` to `app-uat-02`.

Session Manager gives you a shell and port forwarding. It does not give you a copy command between two servers. So the file has to travel some other way.

## Option 1: S3 as the hand-off

Put the file in a bucket from server A and pull it from server B.

```
# on server A
aws s3 cp /var/www/releases/app-2.4.1.tar.gz s3://my-handoff-bucket/tmp/

# on server B
aws s3 cp s3://my-handoff-bucket/tmp/app-2.4.1.tar.gz /home/ec2-user/incoming/
```

This is the right answer for large files, repeated jobs and anything that needs an audit trail. The costs are setup and housekeeping: a bucket, an instance role on both servers that allows the bucket, two commands per file, and a clean-up step so the file does not sit in S3 forever. For a quick one-off it is a lot of ceremony.

## Option 2: Two port-forwarded tunnels and scp through your PC

Open one tunnel per server, then copy down and back up.

```
aws ssm start-session --target i-0aaa1111bbbb2222c ^
  --document-name AWS-StartPortForwardingSession ^
  --parameters "portNumber=22,localPortNumber=2201"

aws ssm start-session --target i-0ddd3333eeee4444f ^
  --document-name AWS-StartPortForwardingSession ^
  --parameters "portNumber=22,localPortNumber=2202"
```

Each command stays running in its own window. Then, from a third window:

```
scp -i keyA.pem -P 2201 ubuntu@127.0.0.1:/var/www/releases/app-2.4.1.tar.gz .
scp -i keyB.pem -P 2202 app-2.4.1.tar.gz ec2-user@127.0.0.1:/home/ec2-user/incoming/
```

It works, and it needs nothing in AWS beyond SSM. The price is attention: two terminals, two ports to remember, two key files, the right user for each server, and a copy of the file on your disk in the middle that you must delete.

## Option 3: rsync over a forwarded port

For repeated syncs of a folder, rsync over the same kind of tunnel is hard to beat, because it only sends what changed. It has the same set-up cost as option 2 and the same two-hop shape when the destination is another server. Use it when you sync the same tree again and again.

## Option 4: Two panes and a Copy button

[SSMConnect](/) keeps the SSM tunnels open for every server and has a window built for exactly this job. Open **Servers > File transfer**, and you see two panes.

1. Pick your organization (your company sign-in).
2. Pick a server on the left and one on the right. SSMConnect signs in with each server's saved key.
3. Select files or folders and press **Copy ▶** (or **◀ Copy**).

![The Copy files between servers window with a server in each pane (illustration with sample servers)](/assets/file-transfer-between-servers.png)

The data goes server A, through the SSM tunnel to your PC, through the second tunnel to server B. It streams in small blocks through memory, so nothing lands on your disk. There is no bucket, no role change, no commands and no second terminal. Folders are copied whole, you are warned before anything is replaced, and a progress bar with a Stop button shows what is happening.

Need to read or write files owned by another account, such as a web server user? Pick the user and click **Switch user**. SSMConnect keeps its normal login and works through `sudo -u`. The window never works as root.

## Which one should you use?

| | S3 hand-off | Tunnels and scp | rsync over a tunnel | SSMConnect file window |
|---|---|---|---|---|
| Needs port 22 open | No | No | No | No |
| Setup | Bucket and instance roles | Two tunnels, keys, ports | Same as scp | None after first sign-in |
| Typing per transfer | Two commands | Several commands | One command | A few clicks |
| Copy of the file on your PC | No | Yes, on disk | Depends | No, it streams through memory |
| Best for | Big files, automation, audit | Occasional copies | Repeated folder syncs | Everyday copies between servers |

## Where the file window is not the answer

It is honest to say where it stops:

- **Very large transfers.** The data passes through your PC, so speed depends on your connection to AWS. For hundreds of gigabytes, use S3 or a same-region copy job.
- **Scheduled or repeated jobs.** It is an interactive window, not an automation tool.
- **Windows servers.** Those use Remote Desktop. The file window is for Linux servers over SSH.
- **No resume.** If a file is interrupted, it is copied again from the start.

For the other 90 percent of days, the days when you just need a config file or a build on the other box, two panes and a button is hard to beat.

## Try it

SSMConnect is free and open source (Apache 2.0). [Download it for Windows](https://github.com/poonchezhian/ssmconnect/releases/latest/download/SSMConnect-Setup-x64.exe), add your AWS account in the wizard, and the file window is under the **Servers** menu. The full guide is in [Copy files between servers](/docs/file-transfer/). It is an early release, so please try it on a non-production server first.