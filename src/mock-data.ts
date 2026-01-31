const MOCK_ACTIVITIES = [
  {
    title: "Buy groceries",
    description:
      "Purchase food items for the week, including rice, vegetables, eggs, cooking oil, and snacks for everyone at home.",
    dueDate: "2026-02-02",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=4",
    ],
  },
  {
    title: "Clean living room",
    description:
      "Vacuum the carpet, dust the shelves, wipe surfaces, and rearrange cushions neatly.",
    dueDate: "2026-02-01",
    assignedAvatarUris: ["https://i.pravatar.cc/150?img=2"],
  },
  {
    title: "Pay electricity bill",
    description:
      "Settle the monthly electricity bill online or at the payment center to avoid service disruption.",
    dueDate: "2026-02-03",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=3",
      "https://i.pravatar.cc/150?img=5",
      "https://i.pravatar.cc/150?img=6",
    ],
  },
  {
    title: "Laundry day",
    description:
      "Wash, dry, and properly fold clothes, making sure uniforms and workwear are ready for the week.",
    dueDate: "2026-02-01",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=7",
      "https://i.pravatar.cc/150?img=8",
    ],
  },
  {
    title: "Family meeting",
    description:
      "Hold a family discussion to talk about upcoming plans, responsibilities, and shared expenses.",
    dueDate: "2026-02-04",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=9",
      "https://i.pravatar.cc/150?img=10",
      "https://i.pravatar.cc/150?img=11",
      "https://i.pravatar.cc/150?img=12",
    ],
  },
  {
    title: "Fix kitchen sink",
    description:
      "Inspect the leaking kitchen tap, tighten loose fittings, or replace damaged parts if necessary.",
    dueDate: "2026-02-05",
    assignedAvatarUris: ["https://i.pravatar.cc/150?img=13"],
  },
  {
    title: "Prepare dinner",
    description:
      "Cook dinner for the family, ensuring everyone’s dietary preferences are considered.",
    dueDate: "2026-02-02",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=14",
      "https://i.pravatar.cc/150?img=15",
      "https://i.pravatar.cc/150?img=16",
    ],
  },
  {
    title: "Take out trash",
    description:
      "Gather household waste, tie trash bags securely, and dispose of them at the designated collection point.",
    dueDate: "2026-02-01",
    assignedAvatarUris: ["https://i.pravatar.cc/150?img=17"],
  },
  {
    title: "Water plants",
    description:
      "Water both indoor and outdoor plants, making sure not to overwater delicate ones.",
    dueDate: "2026-02-01",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=18",
      "https://i.pravatar.cc/150?img=19",
    ],
  },
  {
    title: "School homework help",
    description:
      "Sit with the kids to assist with homework, review corrections, and explain difficult topics patiently.",
    dueDate: "2026-02-01",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=20",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=6",
    ],
  },
  {
    title: "Clean backyard",
    description:
      "Sweep the backyard thoroughly, remove weeds, and clear away any debris or fallen leaves.",
    dueDate: "2026-02-06",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=3",
      "https://i.pravatar.cc/150?img=8",
      "https://i.pravatar.cc/150?img=12",
      "https://i.pravatar.cc/150?img=15",
      "https://i.pravatar.cc/150?img=18",
    ],
  },
  {
    title: "Buy cooking gas",
    description:
      "Refill the cooking gas cylinder to ensure uninterrupted meal preparation.",
    dueDate: "2026-02-03",
    assignedAvatarUris: ["https://i.pravatar.cc/150?img=5"],
  },
  {
    title: "Organize documents",
    description:
      "Sort and arrange important family documents such as bills, receipts, and identification papers.",
    dueDate: "2026-02-07",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=9",
      "https://i.pravatar.cc/150?img=14",
      "https://i.pravatar.cc/150?img=19",
    ],
  },
  {
    title: "Car maintenance",
    description:
      "Check engine oil, tyre pressure, lights, and ensure the car is safe for daily use.",
    dueDate: "2026-02-08",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=4",
      "https://i.pravatar.cc/150?img=7",
    ],
  },
  {
    title: "Prepare school lunches",
    description: "Pack healthy lunches and snacks for the kids before school.",
    dueDate: "2026-02-02",
    assignedAvatarUris: ["https://i.pravatar.cc/150?img=10"],
  },
  {
    title: "Restock toiletries",
    description:
      "Buy essential toiletries like soap, toothpaste, tissue, and detergent for the household.",
    dueDate: "2026-02-03",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=11",
      "https://i.pravatar.cc/150?img=16",
      "https://i.pravatar.cc/150?img=20",
    ],
  },
  {
    title: "Plan weekend outing",
    description:
      "Discuss and decide on a fun weekend activity, considering location, transport, and budget.",
    dueDate: "2026-02-09",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=6",
      "https://i.pravatar.cc/150?img=13",
      "https://i.pravatar.cc/150?img=17",
      "https://i.pravatar.cc/150?img=18",
    ],
  },
  {
    title: "Clean fridge",
    description:
      "Remove expired food items, wipe shelves, and reorganize the fridge neatly.",
    dueDate: "2026-02-05",
    assignedAvatarUris: ["https://i.pravatar.cc/150?img=8"],
  },
  {
    title: "Family budget review",
    description:
      "Review household spending, compare it with the budget, and agree on adjustments if needed.",
    dueDate: "2026-02-10",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=5",
      "https://i.pravatar.cc/150?img=9",
      "https://i.pravatar.cc/150?img=14",
      "https://i.pravatar.cc/150?img=20",
    ],
  },
  {
    title: "Organize pantry",
    description:
      "Rearrange pantry items, group similar products together, and discard expired goods.",
    dueDate: "2026-02-11",
    assignedAvatarUris: [
      "https://i.pravatar.cc/150?img=3",
      "https://i.pravatar.cc/150?img=10",
    ],
  },
];

export const getRandomActivities = (count: number) => {
  return MOCK_ACTIVITIES.sort(() => Math.random() - 0.5).slice(0, count);
};
