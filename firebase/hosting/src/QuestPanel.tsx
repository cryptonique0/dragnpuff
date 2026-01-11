import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Progress,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.dragnpuff.xyz";

type QuestReward = { type: "xp" | "nom"; amount: number };
type Quest = {
  id: string;
  title: string;
  description?: string;
  period: "daily" | "weekly" | string;
  goal: number;
  progress: number;
  reward: QuestReward;
  claimed: boolean;
  claimable: boolean;
  remaining: number;
};

type QuestResponse = {
  quests: Quest[];
  balances?: { xp?: number; nom?: number };
};

const formatReward = (reward: QuestReward) => {
  if (!reward) return "";
  return reward.type === "nom"
    ? `${reward.amount} NOM`
    : `${reward.amount} XP`;
};

const QuestCard = ({ quest, onClaim, claiming }: { quest: Quest; onClaim: (id: string) => Promise<void>; claiming: boolean }) => {
  const percent = Math.min(100, Math.round((quest.progress / quest.goal) * 100));

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding={4}
      background="rgba(255,255,255,0.02)"
      borderColor="rgba(255,255,255,0.08)"
    >
      <HStack justify="space-between" align="flex-start" spacing={3}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="sm">{quest.title}</Heading>
            <Badge colorScheme={quest.period === "daily" ? "purple" : "blue"}>{quest.period}</Badge>
          </HStack>
          {quest.description && (
            <Text fontSize="sm" color="gray.300">{quest.description}</Text>
          )}
          <Text fontSize="xs" color="gray.400" mt={1}>
            Reward: {formatReward(quest.reward)}
          </Text>
        </Box>
        {quest.claimed ? (
          <Badge colorScheme="green">Claimed</Badge>
        ) : quest.claimable ? (
          <Button size="sm" colorScheme="teal" onClick={() => onClaim(quest.id)} isLoading={claiming}>
            Claim
          </Button>
        ) : (
          <Badge colorScheme="gray">In Progress</Badge>
        )}
      </HStack>

      <Stack spacing={1} mt={3}>
        <Progress value={percent} colorScheme={quest.claimable ? "teal" : "purple"} />
        <Text fontSize="xs" color="gray.400">
          {quest.progress} / {quest.goal} • {quest.remaining} remaining
        </Text>
      </Stack>
    </Box>
  );
};

export default function QuestPanel() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuestResponse>({ quests: [], balances: { xp: 0, nom: 0 } });

  const grouped = useMemo(() => {
    return data.quests.reduce(
      (acc, quest) => {
        const bucket = quest.period === "daily" ? "daily" : quest.period === "weekly" ? "weekly" : "other";
        acc[bucket] = acc[bucket] || [];
        acc[bucket].push(quest);
        return acc;
      },
      { daily: [] as Quest[], weekly: [] as Quest[], other: [] as Quest[] }
    );
  }, [data.quests]);

  const fetchQuests = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/quests/${encodeURIComponent(address)}?address=${encodeURIComponent(address)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load quests");
      setData(json.data as QuestResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quests");
    } finally {
      setLoading(false);
    }
  };

  const claimQuest = async (questId: string) => {
    if (!address) return;
    setClaimingId(questId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/quests/${encodeURIComponent(address)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, address }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to claim quest");
      setData(json.data as QuestResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to claim quest");
    } finally {
      setClaimingId(null);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchQuests();
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <Box mt={8} width="100%" maxW="720px">
        <Alert status="info" variant="left-accent">
          <AlertIcon />
          Connect a wallet to view quest progress.
        </Alert>
      </Box>
    );
  }

  return (
    <Box mt={10} width="100%" maxW="960px">
      <Heading size="md" mb={3}>Quests & Missions</Heading>
      <Text fontSize="sm" color="gray.300" mb={4}>
        Complete daily and weekly actions to earn XP and NOM. These reset automatically when a new cycle starts.
      </Text>

      {error && (
        <Alert status="error" mb={4} variant="left-accent">
          <AlertIcon /> {error}
        </Alert>
      )}

      <Flex gap={6} wrap="wrap">
        <Box flex="1 1 280px" minW="280px">
          <Heading size="sm" mb={2}>Daily</Heading>
          <Stack spacing={3}>
            {loading && <Spinner />} 
            {!loading && grouped.daily.length === 0 && (
              <Text fontSize="sm" color="gray.400">No daily quests available.</Text>
            )}
            {grouped.daily.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onClaim={claimQuest} claiming={claimingId === quest.id} />
            ))}
          </Stack>
        </Box>

        <Box flex="1 1 280px" minW="280px">
          <Heading size="sm" mb={2}>Weekly</Heading>
          <Stack spacing={3}>
            {loading && <Spinner />} 
            {!loading && grouped.weekly.length === 0 && (
              <Text fontSize="sm" color="gray.400">No weekly quests available.</Text>
            )}
            {grouped.weekly.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onClaim={claimQuest} claiming={claimingId === quest.id} />
            ))}
          </Stack>
        </Box>
      </Flex>

      {data?.balances && (
        <Box mt={6}>
          <Heading size="sm" mb={2}>Rewards</Heading>
          <HStack spacing={4}>
            <Badge colorScheme="purple" fontSize="0.9em">XP: {data.balances.xp || 0}</Badge>
            <Badge colorScheme="teal" fontSize="0.9em">NOM: {data.balances.nom || 0}</Badge>
            <Button size="sm" variant="outline" onClick={fetchQuests} isLoading={loading}>
              Refresh
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
}
