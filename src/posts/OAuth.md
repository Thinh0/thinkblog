---
title: OAuth
date: 2025-08-01
description: My finds and thoughts about OAuth (Open Authorization)
---

# OAuth (Open Authentication)

When I was hunting for my first co-op job, I had two major problems: no experience and lack of knowledge. From some of the job postings I saw, they mentioned about a thing called "OAuth". And I know, doing an overnight research on that won't help me land my co-op interviews. But after reading briefly about OAuth, I found it a bit interesting and think of sharing some of my finds and thoughts through this blog.

## The Origin of OAuth

The making of OAuth started around November 2006, when Blaine Cook (Twitter) was working on Twitter's OpenID implementation and needed a way to delegate API access. He then contacted Chris Messina and they met with David Recordon, Larry Halff (Ma.gnolia), and others at a CitizenSpace OpenID meeting.

Then in April 2007, a small group of implementers from Google wrote a proposal for an open protocol. Turned out, this was not only a problem to OpenID but also caught the attention of DeWitt Clinton from Google, he then expressed his interest in supporting the project, if only as a stakeholder. July 2007, the team drafted an initial specification and the group was open-to-join for anyone who have interests and want to contribute to the project. Finally, on October 3rd, 2007, the final draft OAuth Core 1.0 was released.

## How Does It Work?

Before reading articles about OAuth, I didn't have much awareness about password phishing or other kinds of cyber attacks. I thought OAuth was just another way to sign in but just a little faster than using regular passwords so I didn't use OAuth. But after going through OAuth, I finally understand why so many websites and applications use this type of sign in. So, what is it? OAuth is a security protocol that solves the problem of third-party applications needing access to user data without sharing their passwords. Instead of asking users to share their Gmail or Twitter password directly, OAuth works by having the user authorize the app through the service provider (such as Google or Twitter). The service then gives the app a temporary access token that grants specific permissions for a limited time. This token can be used to make API calls on the user's behalf without the need of their password and the user can revoke access anytime. The basic flow involves the app redirecting the user to the service provider's login page, the user then approve the requested permissions, and the service redirecting back with an authorization code that the app exchanges for an access token. Here is an example for better understanding (this actually helps me understand the flow of OAuth):

## OAuth vs. OAuth2.0


