# Voice Testing — Section 12.1

Manual MVP test matrix (60 utterance/environment cases). Record browser/OS, selected language, input method, transcript, parsed intent/entities, result, and whether the original utterance was preserved. Never use a real order account; trade examples must stop at an unapproved preview.

| # | Language / condition | Example or variation | Expected check |
|---:|---|---|---|
| 1 | English | Explain P/E ratio | Glossary answer; text remains visible |
| 2 | English | What is EPS? | Glossary intent |
| 3 | English | Explain market capitalisation | Glossary intent |
| 4 | English | Explain dividend yield | Glossary intent |
| 5 | English | Explain bull market | Glossary intent |
| 6 | English | Explain bear market | Glossary intent |
| 7 | English | Explain mutual funds | Glossary intent |
| 8 | English | Explain bonds | Glossary intent |
| 9 | English | Explain portfolio diversification | Glossary intent |
| 10 | English | Explain stop-loss | Glossary intent |
| 11 | English | Give a company overview of Infosys | Predefined research; demo label |
| 12 | English | Explain key financial ratios | Predefined research |
| 13 | English | Show recent announcements for TCS | Predefined query; no fabricated live data |
| 14 | English | Summarize the IT sector | Predefined research |
| 15 | English | Summarize weekly price movement for Reliance | Predefined query; unavailable feed disclosed |
| 16 | English | Why is Reliance falling today? | Open research says API not set |
| 17 | English | Buy ten shares of Infosys | Order preview intent only; no submission |
| 18 | English | Sell 10 shares of TCS | Correct side, symbol and quantity |
| 19 | English | Buy 2.5 thousand shares of Reliance | Quantity normalized to 2500 |
| 20 | English | Buy 1 lakh shares of TCS | Quantity normalized; clarify invalid scale if unsupported |
| 21 | Hindi | Reliance kyun gir raha hai? | Research; no invented reasons |
| 22 | Hindi | दस शेयर Infosys खरीदो | Preserve transcript; map ten/BUY/INFY |
| 23 | Hindi | दो शेयर TCS बेचो | Map two/SELL/TCS |
| 24 | Hindi | P/E ratio samjhao | Mixed-language term explanation |
| 25 | Hindi | एक लाख रुपये | Preserve rupee amount 100000 |
| 26 | Hindi | डेढ़ करोड़ रुपये | Preserve amount 15000000 |
| 27 | Hindi | रिलायंस का overview | Alias handling or clarification |
| 28 | Hindi | TCS ka portfolio dikhao | Correct language context |
| 29 | Hindi | पाँच शेयर Infosys मत खरीदो | Negation must prevent order preparation |
| 30 | Hindi | दस shares ya bees shares? | Ambiguity must trigger clarification |
| 31 | Hinglish | Reliance ke 10 shares buy karo | Mixed-language BUY and quantity |
| 32 | Hinglish | TCS 2.5 thousand shares bechna hai | SELL; 2500 quantity |
| 33 | Hinglish | Infosys 1.5 crore? | Ambiguous unit/intent asks clarification |
| 34 | Hinglish | HDFC Bank latest news kya hai? | Open research limitation |
| 35 | Hinglish | Nifty ka P/E explain karo | Term/stock ambiguity handled |
| 36 | Hinglish | 10 shares nahi, 5 shares kharido | Use corrected quantity five |
| 37 | Hinglish | Buy mat karo, just explain P/E | Negation prevents trade intent |
| 38 | Hinglish | Reliance 3500 ke neeche ho to alert | Alert intent; no alert created |
| 39 | Kannada | Kannada speech for a P/E explanation request | If STT supports it, retain transcript and answer in preference |
| 40 | Kannada | Kannada speech for buying 10 Infosys shares | Critical entities cross-check; no submit |
| 41 | Kannada | Kannada speech for selling 2 TCS shares | Side/quantity cross-check |
| 42 | Kannada | Mixed Kannada-English Reliance research question | Research limitation; no made-up evidence |
| 43 | Kannada | Kannada speech for 1 lakh rupees | Numeric amount preserved |
| 44 | Kannada | Kannada speech with a negated buy request | Do not create order intent |
| 45 | Marathi | Marathi speech for a P/E explanation request | Transcript and language preference preserved |
| 46 | Marathi | Marathi speech to buy 10 Infosys shares | Critical fields validated |
| 47 | Marathi | Marathi speech to sell 2 TCS shares | Correct side/quantity |
| 48 | Marathi | Mixed Marathi-English Reliance research question | Open query limitation |
| 49 | Marathi | Marathi speech for ₹2,500 | Currency amount preserved |
| 50 | Marathi | Marathi speech with a negated buy request | Do not prepare an order |
| 51 | Tamil | Tamil speech for an EPS explanation request | Transcript/language preserved |
| 52 | Tamil | Tamil speech to buy 10 Infosys shares | Critical fields validated |
| 53 | Tamil | Tamil speech to sell 2 TCS shares | Correct side/quantity |
| 54 | Tamil | Mixed Tamil-English stock movement question | Research limitation |
| 55 | Tamil | Tamil speech for 2.5 thousand | Numeric value preserved |
| 56 | Gujarati | Gujarati speech for a P/E explanation request | Transcript/language preserved |
| 57 | Gujarati | Gujarati speech to buy 10 Infosys shares | Critical fields validated |
| 58 | Gujarati | Mixed Gujarati-English Reliance research question | No fabricated market facts |
| 59 | Any supported language | Repeat commands with a regional accent and background noise | Low confidence/unclear transcript must be editable and not act |
| 60 | Any supported language | Silence for five seconds, mic denial, or speech API unavailable | Stop listening, announce fallback, preserve typed input |

## Recording the run

For each case mark **Pass / Fail / Not supported by the current browser provider**. A case that requires unavailable speech services can still pass the fallback check if the transcript can be entered by typing. The matrix is a planned acceptance set; completion requires actual execution on supported devices and recording results.
