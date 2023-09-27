// Show input box if incident checkbox is checked
let incidentCheckbox = document.querySelector("#incidents");
let incidentActionsFormGroup = document.querySelector(
    "#incident-actions-form-group"
);
incidentCheckbox.addEventListener("change", function () {
    incidentActionsFormGroup.classList.toggle("hidden");
});

// Pre-load the submit button text
const submitButton = document.querySelector("#submit-form-btn");
const submitButtonText = "Generate Progress Note!";
submitButton.innerHTML = submitButtonText;

// Checks if API key is currently being stored in local storage
const apiKeyHTML = document.querySelector("#api-key");
const apiKey = localStorage.getItem("apiKey");
if (apiKey) {
    apiKeyHTML.value = apiKey;
}

// Dynamically saves the API key in local storage persisting the data
apiKeyHTML.addEventListener("input", function (e) {
    localStorage.setItem("apiKey", e.target.value);
    apiKey = e.target.value;
});

// Submit the form
const form = document.querySelector("#progress-note-form");
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Add loading indicators
    submitButton.innerHTML = `<span
    class="spinner-border spinner-border-sm"
    role="status"
    aria-hidden="false"
></span> Generating...`;

    // Fetch form data
    const data = {
        "clients-name": document.querySelector("#clients-name").value,
        "care-plan-details": document.querySelector("#care-plan-details").value,
        "support-worker-name": document.querySelector("#support-worker-name")
            .value,
        "visit-date": document.querySelector("#visit-date").value,
        activities: document.querySelector("#activities").value,
        incidents: document.querySelector("#incidents").checked,
        "incident-actions": document.querySelector("#incident-actions").value,
        deviations: document.querySelector("#deviations").value,
        recommendations: document.querySelector("#recommendations").value,
        "overall-assessment": document.querySelector("#overall-assessment")
            .value,
    };

    // Generate progress note
    const output = await sendRequest(generatePrompt(data), apiKey);

    // Remove loading indicators
    submitButton.textContent = submitButtonText;

    // Show progress note
    document.querySelector("#output").textContent = output;
});

/*
 * This function will use the data to generate and return the prompt
 */
function generatePrompt(data) {
    const prompt = `Consider the following information:\n\nNDIS progress notes help care providers and support workers plan better interventions and evaluate ongoing support and care for their clients. Progress notes contain information about the support delivered during a shift, helping health service providers and loved ones stay informed about a patient’s condition and the progress they’ve made so far.    
    NDIS progress notes (also known as care notes or support logs) are end-of-shift documents created by support workers to report positive and negative incidents relating to their client that occurred during the shift.    
    Progress notes in disability include important information about a client’s progress, goals, events, and support plans. This helps healthcare providers, staff, and others effectively communicate with each other, make shift transitions smoother, and provide better assistance to the client.    
    Progress notes are official documents that can be made part of the legal record for audits, investigations, and legal proceedings. Well-written progress notes help disability care service providers improve their delivery of care, pass NDIS quality audits, and claim legal protection.    
    Moreover, care notes guide health professionals to implement participant goals and are critical to high-quality service delivery. They help keep the families, healthcare providers, and coordinators (including managers and team leaders) updated about patient status, needs, and routines.    
    Details included in progress notes can be used to write client NDIS progress reports – detailed documents that help NDIS (or disability care decision-makers) with monitoring care progress and plan reviews.    
    A progress note does not need to include everything that happened during a shift, only the significant factual details. If you’re already familiar with your client’s behaviour and routines, you should only record any deviations from their regular patterns.\n\n
    How To Write NDIS Progress Notes:\n\nRecord Objective Information\nWrite Concisely\nUse Active Voice\nAvoid Acronyms and Abbreviations\n\nConclusion\nGood progress notes are crucial for providing high-quality care. By following the tips we covered in this article, you’ll be able to produce higher quality NDIS progress notes that enable carers and disability service providers to better understand, communicate, and plan carer interventions and ongoing support for your clients\n\n
    Using the information below, in one paragraph, please generate a summarised NDIS progress note.\nDo not use the below format\nDo not mention the date or time of the visit\nDo not use any prefix or suffix in your response\nThis progress note should be a final version\n
    
    Client's name: ${data["clients-name"]}
    Date: ${data["visit-date"]}
    Support Worker: ${data["support-worker-name"]}
    
    Client's care Plan Information
    ${data["care-plan-details"]}
    
    What care activities did you perform for the client?
    ${data["activities"]}

    Did any significant incidents or issues that occurred during the shift?
    ${data["incidents"] ? "Yes" : "No"}${
        data["incidents"] ? "\n" + data["incident-actions"] : ""
    }

    Were there any deviations from the client's usual behaviour or routines?
    ${data["deviations"]}
    
    Do you have any recommendations for continued care or actions that need to be taken?
    ${data["recommendations"]}
    
    What is the overall assessment of the client's condition and progress during the shift?
    ${data["overall-assessment"]}`;

    return prompt;
}

/*
 * Sends the request to ChatGPT asynchronously
 */
async function sendRequest(prompt, apiKey) {
    const body = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "assistant", content: prompt }],
        temperature: 1,
    };
    try {
        const answer = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(body),
            }
        );
        const data = await answer.json();

        // If error, assume it's because the wrong apikey was used
        if (data.error) {
            document
                .querySelector(".prompt-container:nth-child(1)")
                .scrollIntoView();
            const apiKeyInfo = document.querySelector("#api-key-info");
            apiKeyInfo.style.color = "red";
            apiKeyInfo.textContent = data.error.message;
            throw new Error(data.error.message);
        }

        // Grab and display response
        return data.choices[0].message["content"];
    } catch (error) {
        return error.message;
    }
}
