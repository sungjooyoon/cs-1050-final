---
title: "WALDO Privacymeter, v1.050 — A Browser Extension for Data Privacy and Fraud Aversion"
author: "Sungjoo Yoon — CS 105 — Prof. Jim Waldo"
date: "2024-11-26"
output:
  html_document:
    code_folding: hide
---



Note: All code attached at the bottom

# Project overview

```r
knitr::include_graphics("images/1.png")
```

<div class="figure">
<img src="images/1.png" alt="plot of chunk unnamed-chunk-4" width="2344" />
<p class="caption">plot of chunk unnamed-chunk-4</p>
</div>

The WALDO Privacymeter (v1.050) is a proof-of-concept browser extension that aims to protect citizens’ data privacy and protect them from online fraud schemes. The acronym WALDO, or Website Analysis of Language and Domain-Related Operations, aptly describes the nature of the project. Critically, the Privacymeter aggregates key metrics related to data privacy and fraud risk for any given website—by analyzing its web architecture, language content, and domain characteristics. In turn, the extension informs the user of the website’s ‘safety score’ (a composite rating based on said key metrics) and recommends which level of caution they ought to exercise when disclosing sensitive information, alongside other qualitative features that can either reassure users of a site’s safety or warn them of potential risks. The Privacymeter is unique in its aims, as no other published extension focuses on both local and domain-level factors in producing recommendations to users. In short—by offering real-time insights about online data privacy, it empowers users to construct stronger threat models against bad-faith actors.

# Why the Privacymeter?
As the importance of the internet in our lives increases continuously, so does the need to protect citizens against digital data insecurity and online fraud. Unfortunately, data breaches and internet scams have at times outpaced the development of effective protective measures, leaving us vulnerable to increasingly sophisticated threats. This gap reflects the critical need for tools that proactively evaluate these risks and equip us with actionable information, thus allowing us to safeguard our rightfully-private information. Moreover, granular analysis surrounding the existing data of the issue reflects just how necessary new tools are. Paired with the inadequacy of existing tools, this analysis underscores the urgent need for an informative tool like the Privacymeter—warning users about bad-faith websites that may handle data improperly.

# Data on the problem

```r
knitr::include_graphics("images/2.png")
```

<div class="figure">
<img src="images/2.png" alt="plot of chunk unnamed-chunk-5" width="2341" />
<p class="caption">plot of chunk unnamed-chunk-5</p>
</div>
The empirics on the aforementioned threats confirm the need for a stronger defensive toolkit in this realm. Last year, one in three Americans were affected by cyber fraud, and 349 million people globally were affected by data breaches alone [1], [2]. Relatedly, consumer fraud within the United States topped out over $10 billion, with the Federal Trade Commission noting that digital tools were a primary means for carrying out these scams [3]. Subjectively and similarly, 92% of Americans report being concerned about their privacy, but only 20% routinely report taking steps to protect themselves [4]. 85% of digital citizens globally share the concern for their privacy, while 81% of iOS users even report feeling that the costs of disclosing information digitally to corporations outweighs the benefits [5], [6].

These stark metrics serve as both a warning and an impetus for action. In a perfect world, both the technical environment and culture surrounding digital literacy would align and prevent these trends from occurring. Until then, however, a viable stopgap is to build tools which nudge users towards safer online behaviors.

# Limitations of existing tools
While a limited number of tools already exist in addressing the aforementioned issues, said tools broadly suffer from four critical issues. First, most existing competitors are too narrow in the information they weigh as inputs. Established tools such as ProSe and the University of Texas’s PrivacyCheck analyze only privacy policy text to derive privacy scores, as opposed to a wider variety of structural features (related to local web architecture, language content, and domain-related analysis).

A second limitation similarly relates to narrower analytical scopes, as most existing tools also fail to analyze both privacy and fraud likelihood. Many tools focus exclusively on privacy, while others address only fraud, leaving users without a comprehensive and integrated solution that can evaluate both dimensions. In turn, this creates a reduced incentive to adopt these tools, as increased complexity and decentralization of features make it cumbersome for users to protect themselves. Simply put, most people are not likely to cross-reference multiple extensions to get a complete picture of a website’s threat potential. A single, streamlined tool that consolidates all relevant information is thus necessary and more practical.

Beyond the issue of limited inputs and scopes, a third limitation relates to how many established tools depend solely on asynchronous, crowdsourced reviews (as opposed to live website analysis). Intuitively, reviews are an inefficient and arguably insufficient means to evaluate privacy through, given that they can be subjective, manipulated, or lacking in inputs. However, given the widespread popularity of tools (such as the TrustPilot API and WOT Checker), it is critical that we move users towards more reliable/data-driven solutions, prioritizing objective/real-time analysis over subjective reviews. 

Fourth and finally, many established tools are at the threat of being delisted from platforms and distributors such as the Chrome Web Store, as they mine and sell your data. As evidenced by a cursory search for extensions related to website privacy, a variety of relevant tools published by profit-motivated developers are actively tagged with delisting notices; creating a vacuum to be filled by privacy-respecting alternatives. Users need tools they can trust, and not ones that pretend to ‘protect user data’ while pillaging it for their developers’ gains.

# How does the Privacymeter work?

At its core, and to address the aforementioned flaws, the Privacymeter analyzes websites based on fundamental privacy metrics, and scores websites by aggregating said metrics. Subsequently, it warns users if a website is either insecure or likely to be a fraudulent website, such that they can make more informed decisions to safeguard their sensitive data. Of course, it does not mine user data. This following section will cover the Privacymeter’s technical requirements/structure, inputs/implementation, weights/scoring, and outputs.

# Technical Requirements and Structure

```r
knitr::include_graphics("images/3.png")
```

<div class="figure">
<img src="images/3.png" alt="plot of chunk unnamed-chunk-6" width="1024" />
<p class="caption">plot of chunk unnamed-chunk-6</p>
</div>
The technical details of the Privacymeter are intended to be fairly straightforward and digestible, as to promote transparency for users. Built on the Manifest file format, it is employable on most modern browsers (e.g. Google Chrome, Microsoft Edge, Mozilla Firefox, etc.) [7]. Specifically, it begins by employing a Manifest file, or a configuration file that orchestrates the flow of interaction between the extension’s components. From there, a central content file that holds the functions for aggregating relevant information is utilized. This content file interacts with the background file, whose scripts analyze the website’s dynamic structural elements in real-time. Once the relevant information has been collected, it is populated to the user through the popup files (popup.html and popup.js), which respectively display the layout and behavior of the user interface. For further information on the code itself, please refer to the public repository [8].

# Inputs and implementation
Behind the technical details, the implementation is also straightforward. Broadly, the Privacymeter aggregates three categories of input data from a given website: features related to the site’s web architecture, metrics related to the language content of the page, and characteristics related to its registration and domain analysis.

More specifically, the Privacymeter collects information about the web architecture of a page. It first confirms the validity of the page’s SSL certificate to ensure that the website uses secure communication protocols—a foregone aspect of a secure data environment. It does so by simply referencing the protocol status (window.location.protocol). More critically, it then employs the World Wide Web Consortium’s .isSecureContext call, which indicates whether or not the current page’s context is up to the Consortium’s modern encryption standards—accounting for structural factors such as the security of the ancestor documents, local delivery of files, web apps operating in standalone environments, and so on. Finally, it tracks the number of both popups and trackers underlying the website. With respect to popups, it increments a counter based on the quantity of open() method calls (as to track the number of new windows populated by the website). With respect to trackers, the background script cross-references the Better.fyi list of the 2,167 most common insertion URLs, and counts the number of convergent occurrences.

The Privacymeter simultaneously analyzes the language content of a webpage in two ways. First, it employs rudimentary language processing of the page’s text, in relation to common grammatical errors. It considers common grammatical errors such as malapropisms, mistaken conjugations, incorrect usage of articles, redundant comparatives, and erratic placement of prepositions—intended to catch language content of non-professional or non-native origins. Second, it relies on the same helper function to scan the text content, but this time searching for details regarding the page’s payment information portal. Analyzing for coded key words related to payment (e.g. ‘checkout’, ‘pay now’, ‘billing information’, ‘credit card’, etc.), it flags these terms as markers of potential insecurity; this is given the sensitivity of financial information, recognizing that pages handling transactions are inherently higher-risk and more likely to contain malice. Then, it accounts for specific ‘protected’ payment methods, which offer insights on the reversibility of transactions and can be viewed conservatively as a conduit for legitimacy.

Last but not least, the Privacymeter collects information in relation to characteristics of domain analysis. For starters, the extension references the WHOIS API to analyze the age of the domain, as many phishing and scam websites are registered recently. Similarly, the extension references the IPINFO API to analyze the domain’s country of origin, and whether or not the domain is registered domestically. Furthermore, a third API referenced in this category is the Google SafeBrowsing API, which contains a blacklist of fraudulent domains. Finally, the Privacymeter conducts an unstable registrar check, as illicit domains are often concentrated within a select number of registrars (c.f. the Knujon report on 20 registrars controlling 90% of illicit domains) [9]. Drawing upon the Cybercrime Information Center’s list of the top 50 least stable domain registrars—measured by the proportion of maliciously registered domains to the total number of domains registered—the Privacymeter flags domains registered with these entities as potential risks.

# Weights and scoring

```r
knitr::include_graphics("images/4.png")
```

<div class="figure">
<img src="images/4.png" alt="plot of chunk unnamed-chunk-7" width="2603" />
<p class="caption">plot of chunk unnamed-chunk-7</p>
</div>
Taking the nine aforementioned website characteristics, the Privacymeter subsequently weights these factors to produce a threat assessment (in the form of a privacy score). In the realm of web architecture, a secure protocol and modern encryption methods are coded positively and weighted equally (i.e. each adding ten points to the composite score). An absence of excessive popups is weighted positively at a factor half that of the prior two characteristics, as this function is significantly less accurate in the current deployment. Tracker count is not included as a factor of the score, but is displayed independently as an informative metric. In regards to language content, an absence of accepting payment information is coded positively and weighted equally to the aforementioned factors as well, while proper grammar is weighted at a half-factor (also due to being functionally less accurate in the current build). However, if a payment method with buyer protection is present, the scoring is increased at a rate half that of an absence of accepting payment information. And with respect to domain analysis—domestic registration, a non-blacklisted domain, and the absence of an unstable registrar are coded positively and weighted equally. The age of the domain, however, is weighted proportional to its longevity [10]. If the domain is older than six months, the age is coded positively and weighted equally to all of the other previously-discussed factors. If the domain is older than five years, the age remains coded positively, but weighted at a factor of two compared to the prior check; if the domain is older than five or ten years, it is weighed at a factor of three and four respectively.

# Output and effectiveness

```r
knitr::include_graphics("images/5.png")
```

<div class="figure">
<img src="images/5.png" alt="plot of chunk unnamed-chunk-8" width="2411" />
<p class="caption">plot of chunk unnamed-chunk-8</p>
</div>
The visual above represents how the Privacymeter’s scoring system scores various websites, ranging from ‘google.com’ to ‘utrustbiz.ru’ and websites implicated in the Doppelgangers website scandal [11]. Notably, based on the score calculated, the Privacymeter displays a different qualitative assessment (alongside said score). If the score is greater than 80, the extension will inform the user that “[this] site appears safe”. If the score is greater than or equal to 50, but less than or equal to 80, the extension will read “Beware: this website may be risky!”. And if the score is below 50, the extension reads “Warning: scam likely!”. Simultaneously, it displays which positively-coded criteria were satisfied, adjacent to the counter for trackers. While the Privacymeter is certainly imperfect in its current state, these results reflect the promising potential for enhancing user safety through its automated threat assessments.

# Limitations
As the Privacymeter currently exists, it is a proof-of-concept project that requires a significant amount of further development. While the prototype reflects the concept’s potential for practical application, a wide variety of issues currently hold back its functionality and predictive power. In that vein, and beyond standard improvements in function accuracy, a proportionally wide variety of future (conceptual) improvements should be considered.

To begin, research should be done to implement a more academic and standardized approach to its weights. As it currently stands, most of the factors are given relatively equal consideration, and heavier weights were only assigned as a result of trial and error. However, a systematized approach to weighting factors would help the extension to be more accurate in discriminating between ‘safe’ and ‘unsafe’ websites. With more time, statistical analysis would shed light on which factors are most relevant and predictive.

Further, a reduced dependence on external APIs would benefit its effectiveness. This is for three primary reasons. First, external APIs are quite expensive; they are also cost-prohibitive to scaling up the reach of the project (due to token-based limitations, which are present in all three external APIs employed for this extension). Second, relying less on external APIs would enhance the extension’s security, as queries invoke transmission of information such as metadata. Third and perhaps most impactfully, reduced dependence would shore up vulnerabilities in the supply of the Privacymeter’s inputs—as service outages or breaches within the API affect all products which employ them.

A final basis for future improvement is flexibility and adaptability to different website formats, layouts, and interfaces. Currently, while most websites are compatible with the Privacymeter, certain exceptions exist (where the extension will not function properly, and crash at times). Handling these edge cases is a priority not only for the purposes of accuracy, but also because fraudulent websites can exploit the structure of said edge cases. Similarly, in the vein of flexibility, the Privacymeter’s local language analysis and its functions should be more adaptable to changing language norms. The potential for non-professional or non-native actors to employ generative AI for deceptive purposes has increased given the rapid rise of tools such as ChatGPT, which may disaffect the effectiveness of local language analysis as a predictive factor for insecurity or fraudulence. A more encompassing version of the Privacymeter thus requires an expanded language analysis model, beyond the severely-limited detection systems it currently has (on its narrow set of grammar rules).

# Conclusion and reflection
Building this project has taken a lot more time than I anticipated (largely because debugging across an unfamiliar file structure has been rather time-consuming), but it has certainly also been meaningful and enjoyable. Not only have I learned how browser extensions function (I have little front-end experience and also generally stink at JavaScript), but I have appreciated the opportunity to explore the process of building in the realm of data privacy (i.e. identifying a specific problem, figuring out where the pain points are, and trying to build a tool that will ‘nudge’ users to avoid said points).

Inherent to that process, the WALDO Privacymeter v1.050 has become a blueprint for further exploration within this realm. As it stands, it serves as a precursory tool that lays the foundation for further development, all in order to expand the toolkit we have to fight the bad-faith actors behind privacy violations. As it may hopefully progress, I hope it inspires the creation of a full-fledged/debugged extension that helps citizens avoid data breaches and fraudulent schemes. Until then, it remains a purposeful step towards putting control back in the hands of people, amidst an increasingly surveilled world.

# Works Cited

[1] M. Newall and C. Deeney, “Nearly 1 in 3 Americans report being a victim of online financial fraud or cybercrime,” Ipsos, Dec. 2023. https://www.ipsos.com/en-us/nearly-1-3-americans-report-being-victim-online-financial-fraud-or-cybercrime

[2] B. Thies, “Cybersecurity Industry Statistics: ATO, Ransomware, Breaches & Fraud,” SpyCloud, Jan. 15, 2024. https://spycloud.com/blog/cybersecurity-industry-statistics-account-takeover-ransomware-data-breaches-bec-fraud/

[3] Federal Trade Commission, “As Nationwide Fraud Losses Top $10 Billion in 2023, FTC Steps Up Efforts to Protect the Public,” Federal Trade Commission, Feb. 09, 2024. https://www.ftc.gov/news-events/news/press-releases/2024/02/nationwide-fraud-losses-top-10-billion-2023-ftc-steps-efforts-protect-public

[4] Finjan Cybersecurity, “While 92% of Americans Say Online Privacy Is Important, Only 20% Routinely Take Steps to Protect Themselves,” 2019. Available: https://content.equisolve.net/_ea41b6671ddf1a0affe04c0340352773/finjan/news/2019-06-19_While_92_of_Americans_Say_Online_Privacy_Is_781.pdf

[5] E. Bonnie and A. Fitzgerald, “Data Privacy Statistics: The Facts You Need To Know In 2024,” Secureframe, Mar. 05, 2024. https://secureframe.com/blog/data-privacy-statistics

[6] J. Welch, “30 Shocking Online Privacy Statistics All Internet Users Should Be Aware Of | Embryo,” embryo.com, Dec. 11, 2023. https://embryo.com/blog/online-privacy-statistics/

[7] Chrome for Developers, “Manifest file format,” Chrome for Developers. https://developer.chrome.com/docs/extensions/reference/manifest

[8] S. Yoon, “GitHub - sungjooyoon/cs-1050-final: CS 1050 Final Project,” GitHub, 2024. https://github.com/sungjooyoon/cs-1050-final

[9] M. Heller, “20 registrars control 90% of illicit domains, says Knujon,” InfoWorld, May 12, 2008. https://www.infoworld.com/article/2318963/20-registrars-control-90-of-illicit-domains-says-knujon.html

[10] Justia, “US Patent Application for Ranking Domains Using Domain Maturity Patent Application (Application #20080086467 issued April 10, 2008) - Justia Patents Search,” Justia.com, Oct. 10, 2006. https://patents.justia.com/patent/20080086467

[11] U.S. Department of Justice, “Justice Department Disrupts Covert Russian Government-Sponsored Foreign Malign Influence Operation,” Justice.gov, Sep. 04, 2024. https://www.justice.gov/opa/pr/justice-department-disrupts-covert-russian-government-sponsored-foreign-malign-influence

# GitHub Pages index.html generator script


```r
knit("index.Rmd", output = "index.md")
```

```
## 
## 
## processing file: index.Rmd
```

```
## Error in parse_block(g[-1], g[1], params.src, markdown_mode): Duplicate chunk label 'setup', which has been used for the chunk:
## knitr::opts_chunk$set(echo = TRUE)
## library(markdown)
## library(knitr)
```

```r
markdownToHTML("index.md", "index.html")
```
