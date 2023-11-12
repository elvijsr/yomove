import React from "react";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Avatar from "@mui/joy/Avatar";
import { ListItemDecorator } from "@mui/joy";

function ChallengeLeaderboard({ scores }) {
  return (
    <List>
      {scores.slice(0, 15).map((score, index) => (
        <ListItem key={index}>
          {score.placement}.
          <ListItemDecorator>
            <Avatar src={score.avatarSrc} />
          </ListItemDecorator>
          {score.username} - {score.score}
        </ListItem>
      ))}
    </List>
  );
}

export default ChallengeLeaderboard;
