import { List, ListItem, ListItemDecorator, Avatar } from "@mui/joy";

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
