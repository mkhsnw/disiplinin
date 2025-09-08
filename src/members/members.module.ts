import { Module } from "@nestjs/common";
import { MemberService } from "./members.service";
import { MemberController } from "./members.controller";

@Module({
  exports: [MemberService],
  controllers: [MemberController],
  providers: [MemberService]
})
export class MembersModule {}