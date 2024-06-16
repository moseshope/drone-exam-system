const { Configuration, OpenAIApi } = require('openai');
const config = require('../config');
const { sleep } = require('./helpers');
const { _log, _error } = require('./logging');

const configuration = new Configuration({ apiKey: config.OPENAI_API_KEY });

const openai = new OpenAIApi(configuration);

exports.getDescription = async (image_url) => {
  try {
    _log("...Starting...");
    const props = {
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: "system",
          content: [
            { type: "text", text: "You are a helpful GPT-4 assistant designed to describe the image provided in a detailed manner, like a BLIP captioning model. The goal is for another text-to-image model to be able to recreate the image from your description, so be extremely accurate and detailed in describing the image." },
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "iamge_url", image_url: {
                url: image_url
              }
            },
            { type: "text", text: "describe this image like a blip captioning model so that another text-to-image model can take your response and recreate this exact image." },
          ]
        }
      ]
    }

    const completion = await openai.createChatCompletion(props);
    return completion.data.choices[0].message.content;
  } catch (error) {
    _error("chatGPT.js:getDescription", error);
    return "";
  }
}

exports.getPromptByKeywords = async (desc, prev, i = 0) => {
  try {
    let prompt = `Turn these descriptions into a cohesive sentence: \n
    ${desc}
    `;
    if (prev) {
      prompt = `Edit this prompt with the following instruction “${desc}”. Keep as much of the original prompt intact, only change what’s needed to integrate the new instructions: \n
      ${prev}
      `;
    }
    const props = {
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
          ]
        }
      ]
    }
    const completion = await openai.createChatCompletion(props);
    _log("Prompt generated");
    return completion.data.choices[0].message.content;
  } catch (error) {
    _error("chatGPT.js:getPromptByKeywords", error);
    await sleep(1);
    if (i < 2) {
      return this.getPromptByKeywords(desc, prev, i + 1);
    }
    return "Sorry! Something went wrong.";
  }
}

exports.getIdeas = async (prompt, i = 0) => {
  try {
    const props = {
      model: 'gpt-4-0125-preview',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: "system",
          content: `You are a helpful and creative focused GPT-4 assistant designed to come up with clever and creative ideas to change an existing image into a new concept. The goal is to showcase different creative ideas and unique concepts for image prompts that will be used in a text-to-image generator. Provide your answer in JSON structure like this {'ideas': ['', '', ...]}`
        },
        {
          role: "user",
          content: `What are 10 creative/clever changes this text-to-image prompt including, Style changes, add/remove elements, color changes, background changes: \n ${prompt}`,
        }
      ]
    }
    const completion = await openai.createChatCompletion(props);
    _log("Prompt generated"/* , completion.data.choices[0].message.content */);
    const data = JSON.parse(completion.data.choices[0].message.content);
    return data.ideas;
    // return [];
  } catch (error) {
    _error("chatGPT.js:getIdeas", error.message);
    await sleep(1);
    if (i < 2) {
      return this.getIdeas(prompt, i + 1);
    } else {
      return [];
    }
  }
}

exports.getBlendIdeas = async (prompt, i = 0) => {
  try {
    _log("Blend Idea generation started!");
    const props = {
      model: 'gpt-4-0125-preview',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: "system",
          content: `You are a helpful and creative focused GPT-4 assistant designed to come up with clever and creative ideas to change an existing image into a new concept. The goal is to showcase different creative ideas and unique concepts for image prompts that will be used in a text-to-image generator. Provide your answer in JSON structure like this {'ideas': ['', '', ...]}`
        },
        {
          role: "user",
          content: `Come up with 50 Concept Blending variations on this description:\n
          ${prompt}`,
        }
      ]
    }
    const completion = await openai.createChatCompletion(props);
    _log("Blend Idea generation finished!"/* , completion.data.choices[0].message.content */);
    const data = JSON.parse(completion.data.choices[0].message.content);
    return data.ideas;
    // return [];
  } catch (error) {
    _error("chatGPT.js:getBlendIdeas", error.message);
    await sleep(1);
    if (i < 2) {
      return this.getBlendIdeas(prompt, i + 1);
    } else {
      return [];
    }
  }
}