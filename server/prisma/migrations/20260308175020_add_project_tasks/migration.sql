-- CreateTable
CREATE TABLE "project_tasks" (
    "id" TEXT NOT NULL,
    "sop_instance_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "phase" VARCHAR(100) NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "SopTaskStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_to" TEXT,
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "note" TEXT,
    "blocked_reason" TEXT,
    "is_decision_point" BOOLEAN NOT NULL DEFAULT false,
    "decision_outcome" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_sop_instance_id_fkey" FOREIGN KEY ("sop_instance_id") REFERENCES "sop_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
