import { Joke } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = { randomJoke: Joke };
export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({ take: 1, skip: randomNumber });

  const data: LoaderData = { randomJoke };
  return data;
};

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
    </div>
  );
}
