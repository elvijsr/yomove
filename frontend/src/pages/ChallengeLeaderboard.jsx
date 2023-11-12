import { List, ListItem, ListItemDecorator, Avatar } from "@mui/joy";

function ChallengeLeaderboard({ scores }) {
  const adjustAvatarUrl = (avatarSrc) => {
    const urlParts = avatarSrc.split("/");

    const publicId = urlParts[urlParts.length - 1].split(".")[0];
    const version = urlParts[urlParts.length - 2];

    const newUrl = `https://res.cloudinary.com/dpajrrxiq/image/upload/w_100,h_100,c_fill,q_70/${version}/${publicId}.png`;

    return newUrl;
  };

  return (
    <List>
      {scores.slice(0, 15).map((score, index) => (
        <ListItem key={index}>
          {score.placement}.
          <ListItemDecorator>
            <Avatar src={adjustAvatarUrl(score.avatarSrc)} />
          </ListItemDecorator>
          {score.username} - {score.score}
        </ListItem>
      ))}
    </List>
  );
}

export default ChallengeLeaderboard;
