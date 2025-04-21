import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MatchScore {
  profile: any;
  score: number;
  matchReasons: string[];
}

export function useMatching() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateMatchScore = (userProfile: any, potentialMatch: any): MatchScore => {
    let score = 0;
    const matchReasons: string[] = [];

    // Role and Looking For match (40% weight)
    if (potentialMatch.looking_for.includes(userProfile.title)) {
      score += 40;
      matchReasons.push(`Looking for a ${userProfile.title}`);
    }

    // Skills overlap (20% weight)
    const skillMatches = potentialMatch.skills.filter((skill: string) =>
      userProfile.skills.includes(skill)
    );
    if (skillMatches.length > 0) {
      score += (skillMatches.length / potentialMatch.skills.length) * 20;
      matchReasons.push(`Shares ${skillMatches.length} skills with you`);
    }

    // Project stage match (10% weight)
    if (potentialMatch.project_stage === userProfile.project_stage) {
      score += 10;
      matchReasons.push(`At the same project stage: ${userProfile.project_stage}`);
    }

    // Industry match (10% weight)
    const industryMatches = potentialMatch.preferred_industries.filter((industry: string) =>
      userProfile.preferred_industries.includes(industry)
    );
    if (industryMatches.length > 0) {
      score += (industryMatches.length / potentialMatch.preferred_industries.length) * 10;
      matchReasons.push(`Interested in ${industryMatches.length} of your industries`);
    }

    // Work type match (10% weight)
    const workTypeMatches = potentialMatch.preferred_work_type.filter((type: string) =>
      userProfile.preferred_work_type.includes(type)
    );
    if (workTypeMatches.length > 0) {
      score += (workTypeMatches.length / potentialMatch.preferred_work_type.length) * 10;
      matchReasons.push(`Prefers ${workTypeMatches.length} of your work types`);
    }

    // Experience level compatibility (10% weight)
    const experienceLevels = ["Student", "Entry Level", "Mid Level", "Senior Level", "Executive"];
    const userLevelIndex = experienceLevels.indexOf(userProfile.experience_level);
    const matchLevelIndex = experienceLevels.indexOf(potentialMatch.experience_level);
    
    if (Math.abs(userLevelIndex - matchLevelIndex) <= 1) {
      score += 10;
      matchReasons.push(`Similar experience level: ${potentialMatch.experience_level}`);
    }

    return {
      profile: potentialMatch,
      score,
      matchReasons,
    };
  };

  const findMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get current user's profile
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get potential matches
      const { data: potentialMatches, error: matchesError } = await supabase
        .from("profiles")
        .select("*")
        .not("id", "eq", user.id)
        .eq("onboarding_completed", true);

      if (matchesError) throw matchesError;

      // Calculate match scores
      const scoredMatches = potentialMatches
        .map((match) => calculateMatchScore(userProfile, match))
        .filter((match) => match.score > 0) // Only include matches with some compatibility
        .sort((a, b) => b.score - a.score); // Sort by match score

      setMatches(scoredMatches);
    } catch (error) {
      console.error("Error finding matches:", error);
      toast.error("Failed to find matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findMatches();
  }, [user]);

  return {
    matches,
    loading,
    refresh: findMatches,
  };
} 