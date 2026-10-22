<!-- Markdown version of https://poonchezhian.github.io/file-transfer/ . Updated 2026-10-22. The HTML page is the canonical version. -->

# Copy files between AWS servers. Port 22 stays closed.

SSMConnect for Windows has a two-pane window for moving files from one server to another through AWS Systems Manager. No S3 bucket, no scp, no bastion host.

1. Pick the organization (your company sign-in).
2. Pick a server on each side. SSMConnect signs in with each server's saved key.
3. Select files or folders.
4. Press Copy.

Data path: Server A, SSM tunnel, your PC, SSM tunnel, Server B. No inbound port is opened, the servers need no network path to each other, and files stream through memory without being saved to your disk. The window never works as root; Switch user uses sudo.

Limits: Linux servers over SSH only; both servers must be connected and in one sign-in organization; speed depends on your connection to AWS; no resume.

Guide: https://poonchezhian.github.io/docs/file-transfer/ . Comparison: https://poonchezhian.github.io/blog/copy-files-between-ec2-servers-port-22-closed/ . Download: https://github.com/poonchezhian/ssmconnect/releases/latest/download/SSMConnect-Setup-x64.exe

**How do I copy files between two EC2 instances without SSH?**
Use SSMConnect for Windows: open Servers, then File transfer, pick a server in each pane and press Copy. It moves the files through AWS Systems Manager tunnels, so port 22 can stay closed on both servers.

**Do the two servers need to reach each other?**
No. Each server is reached from your PC through its own Systems Manager tunnel. They can be in different VPCs, subnets or AWS accounts, as long as both belong to the same sign-in organization.

**Is a copy of my file saved on my PC?**
No. Files are read from one server and written to the other in small blocks that pass through memory. Nothing is saved to your disk.

**Can I copy files owned by another user, such as a web server account?**
Yes. Pick the user and click Switch user. SSMConnect stays signed in as the default user and works through sudo. The window never works as root.

**How big a file can I copy?**
There is no fixed limit in the app, but the data passes through your PC, so speed depends on your connection to AWS. For hundreds of gigabytes or scheduled jobs, use S3 or a same-region copy job. There is no resume: an interrupted file starts again.

**Does it work for Windows servers or on Linux desktops?**
The two-pane window is in SSMConnect for Windows and copies between Linux servers over SSH. Windows servers use Remote Desktop. The Linux desktop app opens each server in your file manager over SFTP.
