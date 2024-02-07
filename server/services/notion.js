const { Client } = require("@notionhq/client")

const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function getTags() {
  const database = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  })

  return notionPropertiesById(database.properties)[
    process.env.NOTION_TAGS_ID
  ].multi_select.options.map(option => {
    return { id: option.id, name: option.name }
  })
}

function notionPropertiesById(properties) {
  return Object.values(properties).reduce((obj, property) => {
    const { id, ...rest } = property
    return { ...obj, [id]: rest }
  }, {})
}

function createSuggestion(title ) {
  notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID,
    },
    properties: {
      [process.env.NOTION_TITLE]: {
        title: [
          {
            type: "text",
            text: {
              content: title,
            },
          },
        ],
      }
    },
  })
}
//createSuggestion('ADD PROJECTT TITLE')
async function getSuggestions() {
  const notionPages = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    // sorts: [{ property: process.env.NOTION_VOTES_ID, direction: "descending" }],
  })

  console.log(notionPages.results.map(fromNotionObject));
}
//getSuggestions();
function fromNotionObject(notionPage) {
  const propertiesById = notionPropertiesById(notionPage.properties)

  return {
    id: notionPage.id,
    title: propertiesById[process.env.NOTION_TITLE].title[0].plain_text,
    owner: propertiesById[process.env.NOTION_OWNER].people,
    status: propertiesById[process.env.NOTION_STATUS].status,
   priority: propertiesById[process.env.NOTION_PRIORITY].select,
   Dates: propertiesById[process.env.NOTION_DATES].date,
  }
}

async function EditNotion(pageId) {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        title: [
          {
            type: "text",
            text: {
              content: "EDITED NOW LOOM ",
            },
          },
        ],
      },
    });
  } catch (error) {
    console.log(error);
  }
}

//EditNotion('60b0706d-aa87-47a2-ab76-6494c111176a');

async function getSuggestion(pageId) {
  return fromNotionObject(await notion.pages.retrieve({ page_id: pageId }))
}



module.exports = {
  createSuggestion,
  getTags,
  getSuggestions,
  EditNotion,
}