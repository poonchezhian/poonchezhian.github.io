<!-- Markdown version of https://poonchezhian.github.io/blog/ssmconnect-2-0-whats-new/ . Updated 2026-10-22. The HTML page is the canonical version. -->

# What is new in SSMConnect 2.0: connections that stay open and a calmer dashboard

SSMConnect 2.0 is a bigger change than the number suggests. Here is what changed between 2.0.0 and 2.0.5, and why.

## Everything connects, and stays connected

2.0.0 opened connections on demand and closed them when idle. In use, that turned out to be one thing too many to think about. From 2.0.1 every server connects when SSMConnect starts (or after you sign in) and stays connected until you click **Stop connections** or exit. If AWS ends a session, SSMConnect quietly opens the next one. A server that fails three tries in a row shows **Stopped** and waits for you to click **Sign in again**. A connection that comes up but drops within 30 seconds now counts as a failed try, so it cannot loop forever.

## The login is checked before PuTTY opens

A green card only meant that the tunnel was up. If the key or user was wrong, PuTTY still said "No supported authentication methods available". Since 2.0.2, before PuTTY, WinSCP, MobaXterm or the file window opens, SSMConnect finds the key that belongs to the server, tests which login user it accepts, saves what works and refreshes the saved sessions. If no key fits, it asks you once for the right key file. In 2.0.4 this became gentler on your servers: when the operating system is known only its own default user is tried, and combinations a server refused are not retried for ten minutes.

## Usage at a glance

Each card shows CPU, memory and disk as three small bars with an icon and a percentage, green under 60, amber to 85 and red above that. In 2.0.5 they sit on the same line as the status, which makes the cards shorter. Reading usage runs a short read-only command through SSM, so in 2.0.4 production servers are read only when you click **Refresh usage**, and the **Servers** menu has a switch to turn automatic reading off.

## A file window that matches

The window for [copying files between servers](/file-transfer/) now shares the dashboard's look: a soft backdrop and glass cards. Both panes start with "Select the server to connect" and connect to nothing until you pick.

## A grid that scrolls

If you have a dozen servers, the cards used to drop to fewer columns and cut off the last row. 2.0.5 places the cards itself, so the columns match the window and the list always scrolls.

## Small things that matter

- Updates replace SSMConnect in place and the app has a fixed Windows identity, so a taskbar pin on Windows 10 survives an update.
- The converted PuTTY keys are readable only by your Windows user.
- The sign-in window only opens links on AWS's own domains.

The full list for every version is in [What's new](/docs/whats-new/). [Download SSMConnect for Windows](https://github.com/poonchezhian/ssmconnect/releases/latest/download/SSMConnect-Setup-x64.exe) and update from inside the app with **Help > Check for updates**.