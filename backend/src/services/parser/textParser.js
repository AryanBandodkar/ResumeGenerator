export function extractContactInfo(text) {

    // Regex patterns to extract email phone github link and linked in profile link

    const emailFormat = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
    const phoneFormat = /(?:\+91[\s-]?)?[6-9]\d{9}/;
    const githubFormat = /https?:\/\/(?:www\.)?github\.com\/[\w.-]+(?:\/[\w.-]+)?/;
    const linkedinFormat = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+/;

    //extracting the stuff mentioned above using regex patterns
    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const githubMatch = text.match(githubRegex);
    const linkedinMatch = text.match(linkedinRegex);

    // matches into [ ] format so extracting the 0th entry which is the actual data
    // if not found placeholder stuff are used so in the end the user cn edit it before generating the reume
    const email = emailMatch ? emailMatch[0] : "dummyemail@gmail.com";
    const phone = phoneMatch ? phoneMatch[0] : "+91 9999999999";
    const github = githubMatch ? githubMatch[0] : "https://github.com/dummyUser";
    const linkedin = linkedinMatch ? linkedinMatch[0] : "https://linkedin.com/in/dummyUser";
  

    return {
        email,
        phone,
        github,
        linkedin
    };
  }