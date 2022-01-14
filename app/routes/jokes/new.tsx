import { ActionFunction, json, redirect, useActionData } from "remix";
import { db } from "~/utils/db.server";

const badRequest = (data: ActionData) => json(data, { status: 400 });

const validateJokeName = (value: string) => {
  if (value.length < 3) {
    return "That joke's name is too short (should be at least 3 characters)";
  }
};

const validateJokeContent = (value: string) => {
  if (value.length < 10) {
    return "That joke is too short (should be at least 10 characters)";
  }
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const name = body.get("name");
  const content = body.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({ formError: "Form not submitted correctly" });
  }

  const fieldErrors: ActionData["fieldErrors"] = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  const fields: ActionData["fields"] = { name, content };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fields, fieldErrors });
  }

  const joke = await db.joke.create({
    data: { name, content },
  });

  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={!!actionData?.fieldErrors?.name || undefined}
              aria-describedby={
                !!actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={!!actionData?.fieldErrors?.content || undefined}
              aria-describedby={
                !!actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
